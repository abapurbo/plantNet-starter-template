require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const nodemailer = require("nodemailer");
const port = process.env.PORT || 4000
const app = express()
// middleware
const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  console.log("hloo", token)
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
    // admin verifyToken  middleware
    const verifyAdmin = async (req, res, next) => {
      const email = req.user?.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      if (!result && !result?.role === 'admin') {
        return res.status(403).send({ message: 'Forbidden Access ! admin only actions' })
      }
      next()

    }
    // email send info
    const sendEmail = (emailAddress, emailData) => {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      });
      // Verify connection
      transporter.verify((error, success) => {
        if (error) {
          console.log('verify hello', error)
        } else {
          console.log(success)
        }
      })
      // send file
      const mailBody = {
        from: `"Maddison Foo Koch" ${process.env.MAILER_USER}`,
        to: emailAddress,
        subject: emailData?.subject,
        html: `<p>${emailData?.message}</p>`, // HTML body
      }
      transporter.sendMail(mailBody, (err, info) => {
        if (err) {
          console.log('error', err)
        }
        else {
          console.log('email', info?.response)
        }
      })
    }
    const verifySeller = async (req, res, next) => {
      const email = req.user?.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      if (!result && !result?.role === 'seller') {
        return res.status(403).send({ message: 'Forbidden Access ! seller only actions' })
      }
      next()

    }
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
        })
        .send({ success: true })

    })
    app.get('/plants', async (req, res) => {
      const result = await plantsCollection.find().toArray();
      res.send(result)
    })
    // specific plants details
    app.get('/plantDetails/:id', verifyToken, async (req, res) => {
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
    //mange order
    app.get('/mange/order', verifyToken, verifySeller, async (req, res) => {
      const email = req.user?.email;

      const query = { 'seller': email };
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
            name: '$plants.name'
          }
        }, {
          $project: {
            plants: 0,


          }
        }
      ]).toArray();
      console.log(result)
      res.send(result)
    })
    // change customer status
    app.patch('/customer/order/:id', verifyToken, verifySeller, async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateStatus = {
        $set: {
          status: status
        }
      }
      const result = await orderCollection.updateOne(filter, updateStatus);
      res.send(result)
    })
    // update your profile
    app.patch('/update/profile/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const updateData = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          name: updateData?.name,
          image: updateData?.image
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    // user role setup
    app.get('/user/role/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send({ role: result?.role });
    })
    // get plants
    app.get('/plants/seller', verifyToken, verifySeller, async (req, res) => {
      const email = req.user?.email;
      const query = { 'seller.email': email }
      const result = await plantsCollection.find(query).toArray();
      res.send(result);
    })


    //  plant delete seller
    app.delete('/plants/:id', verifyToken, verifySeller, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await plantsCollection.deleteOne(query)
      res.send(result);
    })
    app.post('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = req.body;
      console.log("user", user)
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
    // get all user 
    app.get('/all-user/:email', verifyToken, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const query = { email: { $ne: email } }
      const result = await userCollection.find(query).toArray();
      res.send(result)
    })
    // save a plant data in db
    app.post('/plants', verifyToken, verifySeller, async (req, res) => {
      const plant = req.body;
      const result = await plantsCollection.insertOne(plant);
      res.send(result);
    })
    // update seller plants
    app.put('/update/plants/:id', verifyToken, verifySeller, async (req, res) => {

      const id = req.params.id;
      const plant = req.body;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          name: plant?.name,
          price: plant?.price,
          quantity: plant?.quantity,
          category: plant?.category,
          image: plant?.imageUrl,

        }
      }
      const result = await plantsCollection.updateOne(filter, updateDoc);
      res.send(result)
    })
    //order cancel in the database
    app.delete('/order/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const order = await orderCollection.findOne(query)
      if (order.status === 'Delivered') {
        return res.status(409).send({ message: "Sorry, you cannot cancel this order because it has already been delivered." })
      }
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })
    // specific plant quantity update
    app.patch('/plants/quantity/:id', async (req, res) => {
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
      res.send(result);
    })
    // mange user status and role
    app.patch('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (!user || user?.status === 'Requested') {
        return res.status(400).send('You have already requested, wait for some time.')
      }
      const updateDoc = {
        $set: {
          status: 'Requested'
        }
      };
      const result = await userCollection.updateOne(query, updateDoc);
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
      console.log(result)
      if (result?.insertedId) {
        sendEmail(order?.customer?.email, {
          subject: 'Your order successfully',
          message: `You've placed an order successfully.Transaction Id: ${result?.insertedId}`
        })
        // To seller
        sendEmail(plant?.seller?.email, {
          subject: 'Hurray!, You have an order to process',
          message: `Get the plants ready for ${order?.customer?.name}`
        })
      }
      res.send(result)
    })
    // admin stat
    app.get('/admin-stat', verifyToken, verifyAdmin, async (req, res) => {
      const totalUsers = await userCollection.estimatedDocumentCount();
      const totalPlants = await plantsCollection.estimatedDocumentCount();
      const chartData = await orderCollection.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: { $toDate: '$_id' },
              }
            },
            quantity: {
              $sum: '$quantity'
            },
            price: {
              $sum: '$totalPrice'
            },
            orders: {
              $sum: 1
            }
          }
        }, {
           $project:{
            _id:0,
            date:'$_id',
            quantity:1,
            price:1,
            orders:1
           }
        }
      ]).next()
      const orderDetails = await orderCollection.aggregate([
        {
          $group: {
            _id: null,
            // akta akta kore order collection er kache jabo totalPrice juk korbo 
            totalRevenue: { $sum: '$totalPrice' },
            // akta akta kore order collection er kache jabo ar juk korbo koyta order hoyche
            totalOrder: { $sum: 1 }
          }
        }, {
          $project: {
            _id: 0
          }
        }
      ]).next()
      res.send({ totalUsers, totalPlants, ...orderDetails,chartData })
    })
    // update user role
    app.patch('/user-role/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const { updateRole } = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          role: updateRole,
          status: "Verified"
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })
    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: false,
            sameSite: 'lax',
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
