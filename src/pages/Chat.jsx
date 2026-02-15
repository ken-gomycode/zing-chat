import { useAuth } from '../context/AuthContext';
import '../styles/Chat.css';

const Chat = () => {
  const { userProfile, logout } = useAuth();

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="avatar">
              {userProfile?.displayName?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{userProfile?.displayName}</span>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>

        <div className="rooms-section">
          <div className="section-header">
            <h3>Chats</h3>
            <button className="new-chat-btn" title="New Chat">+</button>
          </div>
          <div className="rooms-list">
            <p className="empty-state">No chats yet. Start a new conversation!</p>
          </div>
        </div>
      </aside>

      <main className="chat-main">
        <div className="no-chat-selected">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h2>Welcome to ChatApp</h2>
          <p>Select a chat or start a new conversation</p>
        </div>
      </main>

      <aside className="info-panel">
        <div className="info-header">
          <h3>Details</h3>
        </div>
        <p className="empty-state">Select a chat to see details</p>
      </aside>
    </div>
  );
};

export default Chat;
