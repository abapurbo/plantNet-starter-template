import { Navigate, useLocation } from "react-router-dom";
import useRole from "../hooks/useRole";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/Shared/LoadingSpinner";

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const [role, isLoading] = useRole()

    if (loading) {
        return <LoadingSpinner></LoadingSpinner>
    }
    if (role === 'admin') {
        return children
    }

    return <Navigate to='/dashboard'  replace='true'></Navigate>
};

export default AdminRoute;