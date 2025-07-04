/* eslint-disable react/prop-types */
// eslint-disable-next-line react/prop-types
import { TbFidgetSpinner } from 'react-icons/tb';
import { sortImageName } from '../../utillities';

const AddPlantForm = ({ handleSubmit, setUploadImageText, uploadImageText, isLoading }) => {
console.log(uploadImageText)
  return (
    <div className='w-full min-h-[calc(100vh-40px)] flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50'>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
          <div className='space-y-6'>
            {/* Name */}
            <div className='space-y-1 text-sm'>
              <label htmlFor='name' className='block text-gray-600'>
                Name
              </label>
              <input
                className='w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                name='name'
                id='name'
                type='text'
                placeholder='Plant Name'
                required
              />
            </div>
            {/* Category */}
            <div className='space-y-1 text-sm'>
              <label htmlFor='category' className='block text-gray-600 '>
                Category
              </label>
              <select
                required
                className='w-full px-4 py-3 border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                name='category'
              >
                <option value='Indoor'>Indoor</option>
                <option value='Outdoor'>Outdoor</option>
                <option value='Succulent'>Succulent</option>
                <option value='Flowering'>Flowering</option>
              </select>
            </div>
            {/* Description */}
            <div className='space-y-1 text-sm'>
              <label htmlFor='description' className='block text-gray-600'>
                Description
              </label>

              <textarea
                id='description'
                placeholder='Write plant description here...'
                className='block rounded-md focus:lime-300 w-full h-32 px-4 py-3 text-gray-800  border border-lime-300 bg-white focus:outline-lime-500 '
                name='description'
              ></textarea>
            </div>
          </div>
          <div className='space-y-6 flex flex-col'>
            {/* Price & Quantity */}
            <div className='flex justify-between gap-2'>
              {/* Price */}
              <div className='space-y-1 text-sm'>
                <label htmlFor='price' className='block text-gray-600 '>
                  Price
                </label>
                <input
                  className='w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                  name='price'
                  id='price'
                  type='number'
                  placeholder='Price per unit'
                  required
                />
              </div>

              {/* Quantity */}
              <div className='space-y-1 text-sm'>
                <label htmlFor='quantity' className='block text-gray-600'>
                  Quantity
                </label>
                <input
                  className='w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                  name='quantity'
                  id='quantity'
                  type='number'
                  placeholder='Available quantity'
                  required
                />
              </div>
            </div>
            {/* Image */}
            <div className=' p-4  w-full  m-auto rounded-lg flex-grow'>
              <div className='file_upload px-5 py-3 relative border-4 border-dotted border-gray-300 rounded-lg'>
                <div className='flex flex-col w-max mx-auto text-center'>
                  <label>
                    <input
                      className='text-sm cursor-pointer w-36 hidden'
                      onChange={e => setUploadImageText({image:e.target.files[0],url:URL.createObjectURL(e.target.files[0])})}
                      type='file'
                      name='image'

                      id='image'
                      accept='image/*'
                      hidden
                    />

                    <div className='bg-lime-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-lime-500'>
                     {
                      sortImageName(uploadImageText?.image)
                     }
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className='flex  space-x-18 items-center text-xl'>
              {
                uploadImageText?.image?.size && (
                  <>
                    {/* URL.createObjectURL die a */}
                    <img className='w-10 h-10' src={uploadImageText?.url} alt="plants image" />


                    <p >Image size:{uploadImageText?.image?.size} Bytes</p>
                  </>
                )
              }
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='w-full p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-lime-500 '
            >
              {
                isLoading ? <TbFidgetSpinner className='animate-spin m-auto' /> : ' Save & Continue'
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddPlantForm
