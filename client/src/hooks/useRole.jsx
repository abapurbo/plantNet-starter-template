import useAxiosSecure from '../hooks/useAxiosSecure';
import useAuth from './useAuth';
import { useQuery } from '@tanstack/react-query';
const useRole = () => {
    const axiosSecure = useAxiosSecure()
    const { user,loading} = useAuth();
    const { data: role, isLoading } = useQuery({
        queryKey: ['role', user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/user/role/${user?.email}`);
            return res.data.role
        }
    })

    return [role, isLoading];
};

export default useRole;