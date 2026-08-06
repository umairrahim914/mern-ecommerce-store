import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // Wait until we've checked localStorage before deciding — prevents the
  // "flash of redirect" bug we discussed when building AuthContext
  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;