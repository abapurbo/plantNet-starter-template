import { Helmet } from 'react-helmet-async'
import AddPlantForm from '../../../components/Form/AddPlantForm'
import { imageUpload } from './../../../api/utilites';
import useAuth from './../../../hooks/useAuth';
import useAxiosSecure from './../../../hooks/useAxiosSecure'
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const AddPlant = () => {
  const { user } = useAuth()
  const [uploadImageText, setUploadImageText] = useState({image:{ name: 'Upload Image' }});
  console.log('image',uploadImageText)
  const [isLoading, setIsLoading] = useState(false);
  const axiosSecure = useAxiosSecure()
  const handleSubmit = async e => {

    e.preventDefault();
    setIsLoading(true)
    const form = e.target;
    const name = form.name.value;
    const description = form.description.value;
    const category = form.category.value;
    const price = parseFloat(form.price.value);
    const quantity = parseInt(form.quantity.value);
    const image = form.image.files[0];
    const imageURL = await imageUpload(image);

    // save seller info;
    const seller = {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL
    }
    // Create plant data object
    const plantData = {
      name,
      category,
      description,
      price,
      quantity,
      image: imageURL,
      seller,
    }
    // save a database 
    try {

      await axiosSecure.post('/plants', plantData)
      .then(res=>console.log(res))
      toast.success('Data Added Successfully!')
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }

  }

  return (
    <div>
      <Helmet>
        <title>Add Plant | Dashboard</title>
      </Helmet>

      {/* Form */}
      <AddPlantForm handleSubmit={handleSubmit} uploadImageText={uploadImageText} setUploadImageText={setUploadImageText} isLoading={isLoading} />
    </div>
  )
}

export default AddPlant
