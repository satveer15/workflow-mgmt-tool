import { NavLink } from 'react-router-dom';
import { useRole } from '../../hooks';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { canViewAnalytics } = useRole();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '📊',
      show: true,
    },
    {
      path: '/tasks',
      label: 'Tasks',
      icon: '✓',
      show: true,
    },
    {
      path: '/kanban',
      label: 'Kanban',
      icon: '📋',
      show: true,
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: '📈',
      show: canViewAnalytics,
    },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              end
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};
