import { useChat } from '../context/ChatContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import './RoomList.css';

const RoomList = () => {
  const { rooms, activeRoom, selectRoom, loadingRooms, getRoomDisplayName, error } = useChat();

  if (error) {
    return (
      <div className="room-list-error">
        <p>Failed to load chats</p>
        <p className="hint">Check console for details</p>
      </div>
    );
  }

  if (loadingRooms) {
    return (
      <div className="room-list-loading">
        <div className="skeleton-room" />
        <div className="skeleton-room" />
        <div className="skeleton-room" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="room-list-empty">
        <p>No chats yet</p>
        <p className="hint">Start a new conversation!</p>
      </div>
    );
  }

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`room-item ${activeRoom?.id === room.id ? 'active' : ''}`}
          onClick={() => selectRoom(room)}
        >
          <div className="room-avatar">
            {room.type === 'direct' ? (
              <span>{getRoomDisplayName(room).charAt(0).toUpperCase()}</span>
            ) : (
              <span>#</span>
            )}
          </div>
          <div className="room-info">
            <div className="room-header">
              <span className="room-name">{getRoomDisplayName(room)}</span>
              {room.lastMessageAt && (
                <span className="room-time">
                  {formatDistanceToNow(room.lastMessageAt)}
                </span>
              )}
            </div>
            {room.lastMessage && (
              <p className="room-preview">{room.lastMessage}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
