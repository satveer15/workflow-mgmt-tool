import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';
import { taskService } from '../../services/taskService';
import type { Task } from '../../types';
import './Header.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setSearchError(null);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await taskService.searchTasks(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error: any) {
        console.error('Search failed:', error);
        const errorMessage = error.response?.data?.message || 'Failed to search tasks. Please try again.';
        setSearchError(errorMessage);
        setSearchResults([]);
        setShowResults(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTaskClick = () => {
    setShowResults(false);
    setSearchQuery('');
    navigate('/tasks');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-logo">📋 Workflow</h1>
        </div>

        {/* Search Bar */}
        <div className="header-search" ref={searchRef}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            {isSearching && <span className="search-spinner">⏳</span>}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="search-results">
              {searchError ? (
                <div className="search-result-error">
                  ⚠️ {searchError}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="search-result-empty">No tasks found</div>
              ) : (
                <div className="search-results-list">
                  {searchResults.slice(0, 8).map((task) => (
                    <div
                      key={task.id}
                      className="search-result-item"
                      onClick={handleTaskClick}
                    >
                      <div className="search-result-title">{task.title}</div>
                      <div className="search-result-meta">
                        <span className="search-result-status">{task.status}</span>
                        <span className="search-result-priority">{task.priority}</span>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 8 && (
                    <div className="search-result-more">
                      +{searchResults.length - 8} more results
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-right">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile */}
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};
