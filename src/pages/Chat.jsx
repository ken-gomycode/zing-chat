import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import RoomList from '../components/RoomList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import NewRoomModal from '../components/NewRoomModal';
import UserSearch from '../components/UserSearch';
import '../styles/Chat.css';

const ChatContent = () => {
  const { userProfile, logout } = useAuth();
  const { activeRoom, getRoomDisplayName } = useChat();
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="avatar">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="" />
              ) : (
                userProfile?.displayName?.charAt(0).toUpperCase()
              )}
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
            <div className="header-actions">
              <button
                className="icon-btn"
                onClick={() => setShowUserSearch(true)}
                title="Find User"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              <button
                className="new-chat-btn"
                onClick={() => setShowNewRoomModal(true)}
                title="New Room"
              >
                +
              </button>
            </div>
          </div>
          <RoomList />
        </div>
      </aside>

      <main className="chat-main">
        {activeRoom ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  {activeRoom.type === 'direct' ? (
                    getRoomDisplayName(activeRoom).charAt(0).toUpperCase()
                  ) : (
                    '#'
                  )}
                </div>
                <div>
                  <h2>{getRoomDisplayName(activeRoom)}</h2>
                  <span className="member-count">
                    {activeRoom.memberCount} {activeRoom.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>
            </div>
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2>Welcome to ChatApp</h2>
            <p>Select a chat or start a new conversation</p>
          </div>
        )}
      </main>

      <aside className="info-panel">
        {activeRoom ? (
          <>
            <div className="info-header">
              <h3>Details</h3>
            </div>
            <div className="info-content">
              <div className="info-section">
                <h4>Room Info</h4>
                <p><strong>Name:</strong> {getRoomDisplayName(activeRoom)}</p>
                <p><strong>Type:</strong> {activeRoom.type === 'direct' ? 'Direct Message' : 'Group'}</p>
                <p><strong>Members:</strong> {activeRoom.memberCount}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="info-header">
              <h3>Details</h3>
            </div>
            <p className="empty-state">Select a chat to see details</p>
          </>
        )}
      </aside>

      <NewRoomModal
        isOpen={showNewRoomModal}
        onClose={() => setShowNewRoomModal(false)}
      />

      <UserSearch
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
      />
    </div>
  );
};

const Chat = () => {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
