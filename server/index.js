require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')

const port = process.env.PORT || 4000
const app = express()
// middleware
const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use('*', cors(corsOptions))

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}
// ata jokhon amra deploy korbo tokhon amra ata use korbo 
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mq0mae1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const uri = 'mongodb://localhost:27017'
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})
async function run() {
  try {
    const userCollection = client.db('plantNet-session').collection('users');
    const plantsCollection = client.db('plantNet-session').collection('plants');
    const orderCollection = client.db('plantNet-session').collection('order')    // Generate jwt token
    app.post('/jwt', async (req, res) => {
      const email = req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          // secure: process.env.NODE_ENV === 'production',
          // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })
    app.get('/plants', async (req, res) => {
      const result = await plantsCollection.find().toArray();
      res.send(result)
    })
    // specific plants details
    app.get('/plantDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantsCollection.findOne(query);
      res.send(result)
    })
    // customer order history
    app.get('/customerOrder/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { "customer.email": email };
      const result = await orderCollection.aggregate([
        {
          $match: query
        },
        {
          $addFields: {
            plantId: { $toObjectId: '$plantId' }
          },
        }, {
          $lookup: {
            from: 'plants',
            localField: 'plantId',
            foreignField: '_id',
            as: 'plants'
          },
        },
        {
          $unwind: '$plants'
        },
        {
          $addFields: {
            name: '$plants.name',
            image: '$plants.image',
            category: '$plants.category',
            price: '$plants.totalPrice',
          }
        }, {
          $project: {
            plants: 0,


          }
        }
      ]).toArray();
      res.send(result);

    })
    app.post('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = req.body;
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.send(isExist)
      }
      const result = await userCollection.insertOne({
        ...user,
        role: 'customer',
        timestamp: new Date(),

      });
      res.send(result);
    })

    // save a plant data in db
    app.post('/plants', verifyToken, async (req, res) => {
      const plant = req.body;
      const result = await plantsCollection.insertOne(plant);
      res.send(result);
    })
    //order cancel in the database
    app.delete('/order/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const order = await orderCollection.findOne(query)
      if (order.status === 'delivered') {
        return res.status(409).send({ message: "Sorry, you cannot cancel this order because it has already been delivered." })
      }
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })
    // specific plant quantity update
    app.patch('/plants/quantity/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const { updateQuantity, status } = req.body;

      const filter = { _id: new ObjectId(id) };
      let updateDoc = {
        $inc: {
          quantity: -updateQuantity
        }
      };
      // status jodi delivered hoy thole 
      if (status === 'increase') {
        updateDoc = {
          $inc: {
            quantity: updateQuantity
          }
        }
      }
      const result = await plantsCollection.updateOne(filter, updateDoc);
      console.log(result)
      res.send(result);
    })
    // mange user status and role
    app.patch('/users/:email',verifyToken,async(req,res)=>{
      const email=req.params.email;
      const query={email:email};
      const user=await userCollection.findOne(query);
      if(!user||user?.status==='requested'){
        return res.status(400).send('You have already requested, wait for some time.')
      }
      const updateDoc={
        $set:{
          status:'requested'
        }
      };
      const result=await userCollection.updateOne(query,updateDoc);
      console.log(result)
      res.send(result)
    })
    // order a plant
    app.post('/order', verifyToken, async (req, res) => {
      const order = req.body;
      const id = order?.plantId;
      const query = { _id: new ObjectId(id) }
      const plant = await plantsCollection.findOne(query);
      let totalPrice = plant?.price;
      if (order?.quantity > plant?.quantity) {
        return res.status(400).send({ status: 'error', message: `Requested quantity exceeds available stock!.Only ${plant?.quantity} items are available.` })
      }
      if (order?.quantity <= plant?.quantity) {
        const quantity = order?.quantity;
        const price = plant?.price;
        totalPrice = price * quantity
      }
      const orderPlant = {
        ...order,
        totalPrice: totalPrice,
        seller: plant?.seller?.email,
        status: 'pending',

      }
      const result = await orderCollection.insertOne(orderPlant);
      res.send(result)
    })
    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
      } catch (err) {
        res.status(500).send(err)
      }
    })

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from plantNet Server..')
})

app.listen(port, () => {
  console.log(`plantNet is running on port ${port}`)
})
