import { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { uploadFile } from '../services/storage';
import './MessageInput.css';

const MAX_IMAGES = 5;

const MessageInput = () => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
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

    // Check if it's an image - if so, use the preview flow
    if (file.type.startsWith('image/')) {
      handleImageSelect(e);
      return;
    }

    // For non-image files, upload immediately
    setUploading(true);
    setUploadProgress(0);

    try {
      const fileData = await uploadFile(file, activeRoom.id, (progress) => {
        setUploadProgress(progress);
      });

      await sendMessage(file.name, 'file', fileData);
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !activeRoom) return;

    // Filter only images
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please select image files only.');
      return;
    }

    // Check total count limit
    const totalImages = selectedImages.length + imageFiles.length;
    if (totalImages > MAX_IMAGES) {
      alert(`You can only select up to ${MAX_IMAGES} images at once.`);
      // Take only what we can fit
      const availableSlots = MAX_IMAGES - selectedImages.length;
      if (availableSlots <= 0) return;
      imageFiles.splice(availableSlots);
    }

    // Create preview URLs for the new images
    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    setSelectedImages(prev => [...prev, ...newImages]);

    // Reset the input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (idToRemove) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === idToRemove);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== idToRemove);
    });
  };

  const cancelImageSelection = () => {
    // Clean up preview URLs
    selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
  };

  const confirmAndSendImages = async () => {
    if (selectedImages.length === 0 || !activeRoom) return;

    setUploading(true);
    setUploadProgress(0);
    setCurrentUploadIndex(0);

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        setCurrentUploadIndex(i);
        const { file } = selectedImages[i];

        const fileData = await uploadFile(file, activeRoom.id, (progress) => {
          // Calculate overall progress
          const overallProgress = ((i * 100) + progress) / selectedImages.length;
          setUploadProgress(overallProgress);
        });

        await sendMessage('', 'image', fileData);
      }

      // Clean up preview URLs
      selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentUploadIndex(0);
    }
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="message-input-container">
      {/* Image Preview Panel */}
      {selectedImages.length > 0 && (
        <div className="image-preview-panel">
          <div className="preview-header">
            <span className="preview-title">
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
            </span>
            <span className="preview-hint">
              {selectedImages.length < MAX_IMAGES && `Add up to ${MAX_IMAGES - selectedImages.length} more`}
            </span>
          </div>
          <div className="preview-images">
            {selectedImages.map((img, index) => (
              <div key={img.id} className="preview-image-item">
                <img src={img.preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(img.id)}
                  disabled={uploading}
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                {uploading && currentUploadIndex === index && (
                  <div className="image-uploading-overlay">
                    <div className="upload-spinner"></div>
                  </div>
                )}
              </div>
            ))}
            {selectedImages.length < MAX_IMAGES && !uploading && (
              <button
                type="button"
                className="add-more-images-btn"
                onClick={openImagePicker}
                title="Add more images"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
          <div className="preview-actions">
            <button
              type="button"
              className="preview-cancel-btn"
              onClick={cancelImageSelection}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="preview-send-btn"
              onClick={confirmAndSendImages}
              disabled={uploading}
            >
              {uploading ? (
                <>Sending {currentUploadIndex + 1}/{selectedImages.length}...</>
              ) : (
                <>Send {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>
          {uploading && (
            <div className="preview-progress">
              <div className="preview-progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Regular upload progress for non-image files */}
      {uploading && selectedImages.length === 0 && (
        <div className="upload-progress">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span>Uploading... {Math.round(uploadProgress)}%</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form">
        {/* Hidden file input for non-image files */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="file-input"
          accept=".pdf,.doc,.docx,.txt,.zip"
        />
        {/* Hidden file input for images (multiple) */}
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageSelect}
          className="file-input"
          accept="image/*"
          multiple
        />
        <button
          type="button"
          className="attach-btn"
          onClick={openImagePicker}
          disabled={uploading || selectedImages.length >= MAX_IMAGES}
          title="Attach images"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
        <button
          type="button"
          className="attach-btn"
          onClick={openFilePicker}
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
