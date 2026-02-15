import { useEffect, useRef } from 'react';
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
          onClick={() => window.open(message.fileURL, '_blank')}
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
    <div className="message-list" ref={containerRef} onScroll={handleScroll}>
      {messages.map((message, index) => {
        const isOwn = message.senderId === user?.uid;
        const showDateSeparator =
          index === 0 ||
          !isSameDay(message.createdAt, messages[index - 1]?.createdAt);
        const showAvatar =
          index === 0 || messages[index - 1]?.senderId !== message.senderId;

        return (
          <div className="message-wrapper" key={message.id}>
            {showDateSeparator && (
              <div className="date-separator">
                <span>{formatMessageDate(message.createdAt)}</span>
              </div>
            )}
            {isOwn ? renderOwnMessage(message) : renderOtherMessage(message, showAvatar)}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
