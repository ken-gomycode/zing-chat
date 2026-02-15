import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { searchUsers } from '../services/users';
import './UserSearch.css';

const UserSearch = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { startDirectChat } = useChat();

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || !user) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const users = await searchUsers(searchTerm, user.uid);
      setResults(users);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, user]);

  useEffect(() => {
    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [handleSearch]);

  const handleSelectUser = async (selectedUser) => {
    await startDirectChat(selectedUser.id, selectedUser.displayName);
    setSearchTerm('');
    setResults([]);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="user-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Find Users</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            autoFocus
          />
        </div>

        <div className="search-results">
          {loading && (
            <div className="search-loading">
              <div className="spinner small" />
              <span>Searching...</span>
            </div>
          )}

          {!loading && searchTerm && results.length === 0 && (
            <div className="no-results">
              <p>No users found</p>
            </div>
          )}

          {!loading && results.map((user) => (
            <div
              key={user.id}
              className="user-result"
              onClick={() => handleSelectUser(user)}
            >
              <div className="user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" />
                ) : (
                  user.displayName?.charAt(0).toUpperCase()
                )}
                <span className={`status-dot ${user.status || 'offline'}`} />
              </div>
              <div className="user-details">
                <span className="user-name">{user.displayName}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
          ))}

          {!loading && !searchTerm && (
            <div className="search-hint">
              <p>Type a name to search for users</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
