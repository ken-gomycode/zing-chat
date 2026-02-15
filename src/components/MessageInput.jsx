import { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { uploadFile } from '../services/storage';
import './MessageInput.css';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { sendMessage, activeRoom } = useChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeRoom) return;

    const messageText = text.trim();
    setText('');
    await sendMessage(messageText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoom) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const isImage = file.type.startsWith('image/');
      const fileData = await uploadFile(file, activeRoom.id, (progress) => {
        setUploadProgress(progress);
      });

      await sendMessage(
        isImage ? '' : file.name,
        isImage ? 'image' : 'file',
        fileData
      );
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="message-input-container">
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span>Uploading... {Math.round(uploadProgress)}%</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="file-input"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={uploading}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!text.trim() || uploading}
          title="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
