import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const RequireAdmin = () => {
  const role = getUserRole();

  if (role !== "ADMIN") {
    // Redirect non-admins to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected admin components
  return <Outlet />;
};

export default RequireAdmin;
