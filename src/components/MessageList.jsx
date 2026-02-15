import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { formatMessageTime, formatMessageDate, isSameDay } from '../utils/dateUtils';
import './MessageList.css';

const MessageList = () => {
  const { user } = useAuth();
  const { messages, loadingMessages } = useChat();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const wasAtBottomRef = useRef(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (wasAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    wasAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  const renderMessageContent = (message) => (
    <>
      {message.type === 'image' && message.fileURL && (
        <img
          src={message.fileURL}
          alt="Shared"
          className="message-image"
          onClick={() => setSelectedImage(message.fileURL)}
        />
      )}
      {message.type === 'file' && message.fileURL && (
        <a
          href={message.fileURL}
          target="_blank"
          rel="noopener noreferrer"
          className="message-file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span>{message.fileName || 'Download file'}</span>
        </a>
      )}
      {message.text && <p className="message-text">{message.text}</p>}
    </>
  );

  const renderOwnMessage = (message) => (
    <div className='own-message' >
      <div className="message own">
        <div className="message-content">
          <div className="message-bubble">
            {renderMessageContent(message)}
            <span className="message-time">
              {formatMessageTime(message.createdAt)}
              <span className="read-receipt">
                {message.readBy?.length > 1 ? '✓✓' : '✓'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOtherMessage = (message, showAvatar) => (
    <div className="message other">
      {showAvatar ? (
        <div className="message-avatar">
          {message.senderPhoto ? (
            <img src={message.senderPhoto} alt="" />
          ) : (
            <span>{message.senderName?.charAt(0).toUpperCase()}</span>
          )}
        </div>
      ) : (
        <div className="message-avatar-spacer" />
      )}
      <div className="message-content">
        {showAvatar && (
          <span className="message-sender">{message.senderName}</span>
        )}
        <div className="message-bubble">
          {renderMessageContent(message)}
          <span className="message-time">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );

  if (loadingMessages) {
    return (
      <div className="message-list-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <p>No messages yet</p>
        <p className="hint">Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <>
      <div className="message-list" ref={containerRef} onScroll={handleScroll}>
        {messages.map((message, index) => {
          const isOwn = message.senderId === user?.uid;
          const showDateSeparator =
            index === 0 ||
            !isSameDay(message.createdAt, messages[index - 1]?.createdAt);
          const showAvatar =
            index === 0 || messages[index - 1]?.senderId !== message.senderId;

          return (
            <div key={message.id}>
              {showDateSeparator && (
                <div className="date-separator">
                  <span>{formatMessageDate(message.createdAt)}</span>
                </div>
              )}
              <div className="message-wrapper">
                {isOwn ? renderOwnMessage(message) : renderOtherMessage(message, showAvatar)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img src={selectedImage} alt="Full size" className="image-modal-img" />
            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="image-modal-download"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;
