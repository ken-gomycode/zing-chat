import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserRooms, createRoom, createDirectRoom, deleteRoom as deleteRoomService } from '../services/rooms';
import { subscribeToMessages, sendMessage as sendMessageService } from '../services/messages';

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // Get activeRoom from rooms array to keep it in sync
  const activeRoom = rooms.find((room) => room.id === activeRoomId) || null;

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setActiveRoomId(null);
      setMessages([]);
      setLoadingRooms(false);
      return;
    }

    setLoadingRooms(true);
    const unsubscribe = subscribeToUserRooms(
      user.uid,
      (updatedRooms) => {
        setRooms(updatedRooms);
        setLoadingRooms(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoadingRooms(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const unsubscribe = subscribeToMessages(
      activeRoomId,
      (newMessages) => {
        setMessages(newMessages);
        setLoadingMessages(false);
      },
      (err) => {
        console.error('Message subscription error:', err);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [activeRoomId]);

  const selectRoom = useCallback((room) => {
    setActiveRoomId(room?.id || null);
  }, []);

  const sendMessage = useCallback(async (text, type = 'text', fileData = null) => {
    if (!activeRoomId || !user || !userProfile) return;

    try {
      await sendMessageService(
        activeRoomId,
        user.uid,
        userProfile.displayName,
        userProfile.photoURL,
        text,
        type,
        fileData
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [activeRoomId, user, userProfile]);

  const createNewRoom = useCallback(async (name) => {
    if (!user) return null;
    const room = await createRoom(name, user.uid);
    return room;
  }, [user]);

  const startDirectChat = useCallback(async (otherUserId, otherUserName) => {
    if (!user || !userProfile) return null;

    // Check if direct room already exists
    const existingRoom = rooms.find(
      (room) =>
        room.type === 'direct' &&
        room.members.includes(otherUserId) &&
        room.members.length === 2
    );

    if (existingRoom) {
      setActiveRoomId(existingRoom.id);
      return existingRoom;
    }

    const room = await createDirectRoom(
      user.uid,
      otherUserId,
      userProfile.displayName,
      otherUserName
    );
    setActiveRoomId(room.id);
    return room;
  }, [user, userProfile, rooms]);

  const getRoomDisplayName = useCallback((room) => {
    if (!room || !user) return '';

    if (room.type === 'direct' && room.participants) {
      const otherUserId = room.members.find((id) => id !== user.uid);
      return room.participants[otherUserId] || 'Unknown';
    }

    return room.name;
  }, [user]);

  const deleteRoom = useCallback(async (roomId) => {
    try {
      await deleteRoomService(roomId);
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
      }
    } catch (err) {
      console.error('Failed to delete room:', err);
      throw err;
    }
  }, [activeRoomId]);

  const value = {
    rooms,
    activeRoom,
    messages,
    loadingRooms,
    loadingMessages,
    error,
    selectRoom,
    sendMessage,
    createNewRoom,
    startDirectChat,
    getRoomDisplayName,
    deleteRoom,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
