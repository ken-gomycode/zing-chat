import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { doc, updateDoc, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';
import { rtdb, db } from './firebase';

export const setupPresence = (userId) => {
  const userStatusDatabaseRef = ref(rtdb, `/status/${userId}`);
  const userStatusFirestoreRef = doc(db, 'users', userId);

  const isOffline = {
    state: 'offline',
    lastChanged: serverTimestamp(),
  };

  const isOnline = {
    state: 'online',
    lastChanged: serverTimestamp(),
  };

  const connectedRef = ref(rtdb, '.info/connected');

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    onDisconnect(userStatusDatabaseRef)
      .set(isOffline)
      .then(() => {
        set(userStatusDatabaseRef, isOnline);

        updateDoc(userStatusFirestoreRef, {
          status: 'online',
          lastSeen: firestoreTimestamp(),
        }).catch(console.error);
      });
  });

  return () => {
    unsubscribe();
    set(userStatusDatabaseRef, isOffline);
    updateDoc(userStatusFirestoreRef, {
      status: 'offline',
      lastSeen: firestoreTimestamp(),
    }).catch(console.error);
  };
};

export const subscribeToUserPresence = (userId, callback) => {
  const userStatusRef = ref(rtdb, `/status/${userId}`);

  return onValue(userStatusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data?.state || 'offline');
  });
};
