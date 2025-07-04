import Container from '../../components/Shared/Container'
import { Helmet } from 'react-helmet-async'
import Heading from '../../components/Shared/Heading'
import Button from '../../components/Shared/Button/Button'
import PurchaseModal from '../../components/Modal/PurchaseModal'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './../../hooks/useAxiosSecure';
import useRole from '../../hooks/useRole'
import LoadingSpinner from './../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth'
const PlantDetails = () => {
  const { user } = useAuth()
  const [role] = useRole()
  let [isOpen, setIsOpen] = useState(false)
  const axiosSecure = useAxiosSecure()
  const { id } = useParams()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['plantDetails', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`${import.meta.env.VITE_API_URL}/plantDetails/${id}`, {
        withCredentials: true
      });
      return res.data

    }

  })

  const closeModal = () => {
    setIsOpen(false)
  }
  if (isLoading) {
    return <LoadingSpinner></LoadingSpinner>
  }

  return (
    <Container>
      <Helmet>
        <title>Money Plant</title>
      </Helmet>
      <div className='mx-auto flex flex-col lg:flex-row justify-between w-full gap-12'>
        {/* Header */}
        <div className='flex flex-col gap-6 flex-1'>
          <div>
            <div className='w-full overflow-hidden rounded-xl'>
              <img
                className='object-cover w-full'
                src={data?.image}
                alt='header image'
              />
            </div>
          </div>
        </div>
        <div className='md:gap-10 flex-1'>
          {/* Plant Info */}
          <Heading
            title={'Money Plant'}
            subtitle={`Category: ${data?.category}`}
          />
          <hr className='my-6' />
          <div
            className='
          text-lg font-light text-neutral-500'
          >
            {data?.description}
          </div>
          <hr className='my-6' />

          <div
            className='
                text-xl 
                font-semibold 
                flex 
                flex-row 
                items-center
                gap-2
              '
          >
            <div>Seller: {data?.seller?.name}</div>

            <img
              className='rounded-full'
              height='30'
              width='30'
              alt='Avatar'
              referrerPolicy='no-referrer'
              src={data?.seller?.image}
            />
          </div>
          <hr className='my-6' />
          <div>
            <p
              className='
                gap-4 
                font-light
                text-neutral-500
              '
            >
              Quantity: {data?.quantity} Units Left Only!
            </p>
          </div>
          <hr className='my-6' />
          <div className='flex justify-between'>
            <p className='font-bold text-3xl text-gray-500'>Price: {data?.price}$</p>
            <div>
              <Button
                disabled={!user ||user?.email===user?.seller?.email || role !== 'customer' || data?.quantity === 0}
                onClick={() => setIsOpen(true)} label={data.quantity > 0 ? 'Purchase' : 'Out look stork'} />
            </div>
          </div>
          <hr className='my-6' />

          <PurchaseModal closeModal={closeModal} isOpen={isOpen} data={data} refetch={refetch} />
        </div>
      </div>
    </Container>
  )
}

export default PlantDetails
