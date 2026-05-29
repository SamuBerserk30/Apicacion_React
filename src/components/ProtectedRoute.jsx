import { Navigate, useLocation } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydratingSession } = useAuth();
  const location = useLocation();

  if (isHydratingSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
