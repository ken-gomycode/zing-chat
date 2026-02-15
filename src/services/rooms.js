import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const roomsRef = collection(db, 'rooms');

export const createRoom = async (name, creatorId, type = 'group') => {
  const roomData = {
    name,
    createdBy: creatorId,
    createdAt: serverTimestamp(),
    members: [creatorId],
    memberCount: 1,
    lastMessage: null,
    lastMessageAt: serverTimestamp(),
    type,
  };

  const docRef = await addDoc(roomsRef, roomData);
  return { id: docRef.id, ...roomData };
};

export const createDirectRoom = async (user1Id, user2Id, user1Name, user2Name) => {
  const roomData = {
    name: `${user1Name}, ${user2Name}`,
    createdBy: user1Id,
    createdAt: serverTimestamp(),
    members: [user1Id, user2Id],
    memberCount: 2,
    lastMessage: null,
    lastMessageAt: serverTimestamp(),
    type: 'direct',
    participants: {
      [user1Id]: user1Name,
      [user2Id]: user2Name,
    },
  };

  const docRef = await addDoc(roomsRef, roomData);
  return { id: docRef.id, ...roomData };
};

export const joinRoom = async (roomId, userId) => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    members: arrayUnion(userId),
    memberCount: (await getDoc(roomRef)).data().memberCount + 1,
  });
};

export const leaveRoom = async (roomId, userId) => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  const currentCount = roomSnap.data().memberCount;

  if (currentCount <= 1) {
    await deleteDoc(roomRef);
  } else {
    await updateDoc(roomRef, {
      members: arrayRemove(userId),
      memberCount: currentCount - 1,
    });
  }
};

export const getRoom = async (roomId) => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    return { id: roomSnap.id, ...roomSnap.data() };
  }
  return null;
};

export const subscribeToUserRooms = (userId, callback) => {
  const q = query(
    roomsRef,
    where('members', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(rooms);
  });
};

export const updateRoomLastMessage = async (roomId, message) => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    lastMessage: message,
    lastMessageAt: serverTimestamp(),
  });
};

export const inviteToRoom = async (roomId, userId) => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  const currentCount = roomSnap.data().memberCount;

  await updateDoc(roomRef, {
    members: arrayUnion(userId),
    memberCount: currentCount + 1,
  });
};
