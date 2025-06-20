/* eslint-disable react/prop-types */
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,

} from '@headlessui/react'
import { Fragment, useState } from 'react'
import useAuth from './../../hooks/useAuth';
import Button from '../Shared/Button/Button';
import { toast } from 'react-hot-toast';
import useAxiosSecure from '../../hooks/useAxiosSecure'
import { useNavigate } from 'react-router-dom';
const PurchaseModal = ({ closeModal, isOpen, data ,refetch}) => {
  const { name, category, price, quantity, _id } = data || {}
  console.log(data)
  // Total Price Calculation
  const { user } = useAuth()
  console.log(user)
  const [totalQuantity, setTotalQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(price)
  const navigate=useNavigate();
  const axiosSecure = useAxiosSecure()
  const [purchaseInfo, setPurchaseInfo] = useState({
    customer: {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL
    },
    plantId: _id,
    quantity: totalQuantity,
    address: '',

  })

  const handleQuantity = value => {
    if (quantity < value) {
      setTotalQuantity(data?.quantity)
      return toast.error('Quantity exceeds available stock!')
    }
    if (value < 1) {
      setTotalQuantity(1)
      return toast.error('Quantity cannot be less than 1')
    }
    setTotalQuantity(value)
    setTotalPrice(value * price)
    setPurchaseInfo(prv => {
      return { ...prv, quantity: value }
    })

  }

  const handlePurchase = async () => {
    console.log('purchase info', purchaseInfo)
    try {
      await axiosSecure.post('/order', purchaseInfo);
      await axiosSecure.patch(`/plants/quantity/${_id}`, { updateQuantity: totalQuantity,status:'decrease' })
      navigate('/dashboard/my-orders')
      toast.success('Order Successfully!')
    }
    catch (err) {
      console.log('error', err)
    } finally {
      refetch()
      closeModal()
    }
  }

  return (

    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0  bg-opacity-25' />
        </TransitionChild>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <DialogTitle
                  as='h3'
                  className='text-lg font-medium text-center leading-6 text-gray-900'
                >
                  Review Info Before Purchase
                </DialogTitle>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Plant: {name}</p>
                </div>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Category: {category}</p>
                </div>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Customer: {user?.displayName}</p>
                </div>

                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Price: $ {totalPrice}</p>
                </div>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Available Quantity: {quantity}</p>
                </div>
                <div className='space-x-2 mt-3 text-sm'>
                  <label htmlFor='quantity' className=' text-gray-600'>
                    Quantity
                  </label>
                  <input
                    className=' px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                    value={totalQuantity}
                    name='quantity'
                    id='quantity'
                    type='number'
                    onChange={(e) => {
                      handleQuantity(parseInt(e.target.value))
                    }}
                    placeholder='Available quantity'
                    required
                  />
                </div>
                <div className='space-x-2 mt-3 text-sm'>
                  <label htmlFor='address' className=' text-gray-600'>
                    Address
                  </label>
                  <input
                    className=' px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                    name='address'
                    id='address'
                    onChange={e => setPurchaseInfo(prv => {
                      return { ...prv, address: e.target.value }
                    })}
                    type='text'
                    placeholder='shipping Address here...'
                    required
                  />
                </div>
                <div className='mt-3'>
                  <Button onClick={handlePurchase} label={`Pay ${totalPrice}`} />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default PurchaseModal
