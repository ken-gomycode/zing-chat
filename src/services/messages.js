import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { updateRoomLastMessage } from './rooms';

const MESSAGES_PER_PAGE = 30;

export const sendMessage = async (roomId, senderId, senderName, senderPhoto, text, type = 'text', fileData = null) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');

  const messageData = {
    senderId,
    senderName,
    senderPhoto: senderPhoto || null,
    text,
    type,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  };

  if (fileData) {
    messageData.fileURL = fileData.url;
    messageData.fileName = fileData.name;
    messageData.fileSize = fileData.size;
  }

  const docRef = await addDoc(messagesRef, messageData);

  const previewText = type === 'text' ? text : type === 'image' ? 'Sent an image' : 'Sent a file';
  await updateRoomLastMessage(roomId, `${senderName}: ${previewText}`);

  return { id: docRef.id, ...messageData };
};

export const subscribeToMessages = (roomId, callback, onError, limitCount = MESSAGES_PER_PAGE) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse();
      callback(messages);
    },
    (error) => {
      console.error('Error subscribing to messages:', error);
      onError?.(error);
    }
  );
};

export const loadMoreMessages = async (roomId, oldestMessage) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  const q = query(
    messagesRef,
    orderBy('createdAt', 'desc'),
    startAfter(oldestMessage.createdAt),
    limit(MESSAGES_PER_PAGE)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .reverse();
};

export const markMessageAsRead = async (roomId, messageId, userId) => {
  const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
  await updateDoc(messageRef, {
    readBy: arrayUnion(userId),
  });
};
