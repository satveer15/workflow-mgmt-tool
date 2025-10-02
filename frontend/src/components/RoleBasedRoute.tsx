import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = user?.roles.some((role) =>
    allowedRoles.includes(role.replace('ROLE_', ''))
  );

  if (!hasAllowedRole) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>403 - Forbidden</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};
