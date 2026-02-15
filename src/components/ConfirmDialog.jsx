import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h2>{title}</h2>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>
            {cancelText || 'Cancel'}
          </button>
          <button className={`btn-confirm ${variant}`} onClick={onConfirm}>
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
