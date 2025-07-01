import useAuth from '../../../hooks/useAuth';
import { imageUpload } from '../../../api/utilites';
import { useLocation, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const UpdateUserProfile = () => {
    const { updateUserProfile, user } = useAuth()
    const axiosSecure = useAxiosSecure()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location?.state?.from?.pathname || '/'
    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        const form = e.target;
        const name = form.name.value;
        const image = form.image.files[0];
        const imageUrl = await imageUpload(image);
        console.log(name,imageUrl)
        const updateData = {
            name,
            image: imageUrl
        }
        try {

            const res = await axiosSecure.patch(`/update/profile/${user?.email}`, updateData)
            console.log(res)


             updateUserProfile(name, imageUrl);
            toast.success('Update your profile')
            navigate(from)

        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div className="hero bg-base-200  min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">

                <div className="card  bg-base-100 w-[300px] shadow-2xl">
                    <h1 className='text-center text-2xl mt-10 font-semibold '>Update Your Profile !</h1>
                    <div className="card-body">
                        <form onSubmit={handleUpdateProfile} className="fieldset ">
                            <label className="label text-[17px] font-semibold">Name</label>
                            <input type="text" name='name' className="input" placeholder="Enter your name" />
                            <label className="label text-[17px] font-semibold">Photo URL</label>
                            <input type="file" name='image' className="file-input" />
                            <button className="btn btn-accent text-[17px] text-white mt-4">Update Your Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateUserProfile;