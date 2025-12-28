import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';

const UserProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Chặn admin vào các route của user
  if (user.role?.toUpperCase() === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default UserProtectedRoute;

