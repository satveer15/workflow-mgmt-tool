import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts';
import './UserProfileDropdown.css';

export const UserProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const initials = user.username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User profile menu"
      >
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user.username}</div>
          <div className="user-role">{user.roles.join(', ').toLowerCase()}</div>
        </div>
        <span className="user-dropdown-icon">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="user-profile-panel">
          {/* User Info Section */}
          <div className="user-profile-section">
            <div className="user-profile-avatar-large">{initials}</div>
            <div className="user-profile-details">
              <div className="user-profile-name">{user.username}</div>
              <div className="user-profile-email">{user.email}</div>
            </div>
          </div>

          {/* Roles Section */}
          <div className="user-profile-roles">
            <div className="user-profile-label">Roles</div>
            <div className="user-profile-role-badges">
              {user.roles.map((role) => (
                <span key={role} className="user-profile-role-badge">
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="user-profile-actions">
            <button className="user-profile-logout-btn" onClick={logout}>
              <span className="logout-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
