import { useAuth } from '../contexts';
import type { Task } from '../types';

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface UseRoleReturn {
  hasRole: (role: Role | Role[]) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasAllRoles: (roles: Role[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  canViewAnalytics: boolean;
  canAssignTasks: boolean;
  canManageUsers: boolean;
  canUpdateTaskStatus: (task: Task) => boolean;
}

/**
 * Custom hook for role-based access control
 * Provides utilities to check user roles and permissions
 */
export const useRole = (): UseRoleReturn => {
  const { user } = useAuth();

  const userRoles = user?.roles || [];

  /**
   * Check if user has a specific role or any of the given roles
   */
  const hasRole = (role: Role | Role[]): boolean => {
    if (Array.isArray(role)) {
      return role.some((r) => userRoles.includes(r));
    }
    return userRoles.includes(role);
  };

  /**
   * Check if user has any of the given roles
   */
  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.some((role) => userRoles.includes(role));
  };

  /**
   * Check if user has all of the given roles
   */
  const hasAllRoles = (roles: Role[]): boolean => {
    return roles.every((role) => userRoles.includes(role));
  };

  // Computed properties for common role checks
  const isAdmin = userRoles.includes('ADMIN');
  const isManager = userRoles.includes('MANAGER');
  const isEmployee = userRoles.includes('EMPLOYEE');

  // Permission-based checks
  const canViewAnalytics = isAdmin || isManager;
  const canAssignTasks = isAdmin || isManager;
  const canManageUsers = isAdmin;

  /**
   * Check if current user can update task status
   * - ADMIN/MANAGER can update any task
   * - EMPLOYEE can only update tasks they created or are assigned to
   */
  const canUpdateTaskStatus = (task: Task): boolean => {
    if (!user) return false;

    // ADMIN and MANAGER can update any task
    if (isAdmin || isManager) return true;

    // EMPLOYEE can update if they created it or are assigned to it
    const isCreator = task.createdById === user.id;
    const isAssignee = task.assignedToId === user.id;

    return isCreator || isAssignee;
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isManager,
    isEmployee,
    canViewAnalytics,
    canAssignTasks,
    canManageUsers,
    canUpdateTaskStatus,
  };
};
