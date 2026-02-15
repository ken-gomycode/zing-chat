import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const usersRef = collection(db, 'users');

export const searchUsers = async (searchTerm, currentUserId, maxResults = 10) => {
  if (!searchTerm.trim()) return [];

  const lowerTerm = searchTerm.toLowerCase();

  const q = query(
    usersRef,
    where('displayName_lowercase', '>=', lowerTerm),
    where('displayName_lowercase', '<', lowerTerm + '\uf8ff'),
    orderBy('displayName_lowercase'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .filter((doc) => doc.id !== currentUserId)
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
};

export const updateUserStatus = async (userId, status) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    status,
    lastSeen: serverTimestamp(),
  });
};

export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, 'users', userId);
  const updateData = { ...data };

  if (data.displayName) {
    updateData.displayName_lowercase = data.displayName.toLowerCase();
  }

  await updateDoc(userRef, updateData);
};
