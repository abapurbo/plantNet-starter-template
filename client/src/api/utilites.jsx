import axios from "axios";

export const imageUpload = async imageData => {
    const formData = new FormData();
    formData.append('image', imageData)
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMG_API_KEY}`, formData, {
        headers: {
            'content-type': 'multipart/form-data'
        }
    })
    console.log('hello', res)
    return res.data.data.display_url
}
export const saveUser = async (user) => {
    console.log('hello ',user.photoURL)
    await axios.post(`http://localhost:4000/users/${user?.email}`,
        {
            name: user?.displayName,
            image: user?.photoURL,
            email: user?.email,
        }, {
        withCredentials: true
    }
    )
        .catch(error => console.log('user error', error))
}

