import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserRooms, createRoom, createDirectRoom } from '../services/rooms';
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
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setActiveRoom(null);
      setMessages([]);
      setLoadingRooms(false);
      return;
    }

    setLoadingRooms(true);
    const unsubscribe = subscribeToUserRooms(user.uid, (updatedRooms) => {
      setRooms(updatedRooms);
      setLoadingRooms(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const unsubscribe = subscribeToMessages(activeRoom.id, (newMessages) => {
      setMessages(newMessages);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [activeRoom]);

  const selectRoom = useCallback((room) => {
    setActiveRoom(room);
  }, []);

  const sendMessage = useCallback(async (text, type = 'text', fileData = null) => {
    if (!activeRoom || !user || !userProfile) return;

    await sendMessageService(
      activeRoom.id,
      user.uid,
      userProfile.displayName,
      userProfile.photoURL,
      text,
      type,
      fileData
    );
  }, [activeRoom, user, userProfile]);

  const createNewRoom = useCallback(async (name) => {
    if (!user) return null;
    const room = await createRoom(name, user.uid);
    return room;
  }, [user]);

  const startDirectChat = useCallback(async (otherUserId, otherUserName) => {
    if (!user || !userProfile) return null;

    const existingRoom = rooms.find(
      (room) =>
        room.type === 'direct' &&
        room.members.includes(otherUserId) &&
        room.members.length === 2
    );

    if (existingRoom) {
      setActiveRoom(existingRoom);
      return existingRoom;
    }

    const room = await createDirectRoom(
      user.uid,
      otherUserId,
      userProfile.displayName,
      otherUserName
    );
    setActiveRoom(room);
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

  const value = {
    rooms,
    activeRoom,
    messages,
    loadingRooms,
    loadingMessages,
    selectRoom,
    sendMessage,
    createNewRoom,
    startDirectChat,
    getRoomDisplayName,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
