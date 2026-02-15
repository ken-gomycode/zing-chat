import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { searchUsers, getAllUsers } from '../services/users';
import './UserSearch.css';

const UserSearch = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const { startDirectChat } = useChat();

  // Load all users when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setInitialLoading(true);
      getAllUsers(user.uid, 30)
        .then((users) => {
          setAllUsers(users);
          setInitialLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load users:', error);
          setInitialLoading(false);
        });
    }
  }, [isOpen, user]);

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

  // Show search results if searching, otherwise show all users
  const displayUsers = searchTerm.trim() ? results : allUsers;
  const isLoading = searchTerm.trim() ? loading : initialLoading;

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
          {isLoading && (
            <div className="search-loading">
              <div className="spinner small" />
              <span>{searchTerm ? 'Searching...' : 'Loading users...'}</span>
            </div>
          )}

          {!isLoading && searchTerm && displayUsers.length === 0 && (
            <div className="no-results">
              <p>No users found</p>
            </div>
          )}

          {!isLoading && !searchTerm && displayUsers.length === 0 && (
            <div className="no-results">
              <p>No other users yet</p>
            </div>
          )}

          {!isLoading && displayUsers.length > 0 && (
            <>
              {!searchTerm && (
                <div className="results-header">
                  <span>All Users ({displayUsers.length})</span>
                </div>
              )}
              {displayUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  className="user-result"
                  onClick={() => handleSelectUser(userItem)}
                >
                  <div className="user-avatar">
                    {userItem.photoURL ? (
                      <img src={userItem.photoURL} alt="" />
                    ) : (
                      userItem.displayName?.charAt(0).toUpperCase()
                    )}
                    <span className={`status-dot ${userItem.status || 'offline'}`} />
                  </div>
                  <div className="user-details">
                    <span className="user-name">{userItem.displayName}</span>
                    <span className="user-email">{userItem.email}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
