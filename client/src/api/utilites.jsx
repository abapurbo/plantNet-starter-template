import axios from "axios";

export const imageUpload = async imageData => {
    const formData=new FormData();
    formData.append('image',imageData)
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMG_API_KEY}`, formData, {
        headers: {
            'content-type': 'multipart/form-data'
        }
    })
    return res.data.data.display_url
}