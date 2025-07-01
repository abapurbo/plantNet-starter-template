import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from './../components/Shared/LoadingSpinner';
import useRole from "../hooks/useRole";

// eslint-disable-next-line react/prop-types
const SellerRoute = ({children}) => {
    const {  loading } = useAuth()
    const [role]=useRole()

    if (loading) {
        return <LoadingSpinner></LoadingSpinner>
    }
    if(role==='seller'){
        return children
    }

    return <Navigate to='/dashboard'  replace='true'></Navigate>
};

export default SellerRoute;