import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadFile = (file, roomId, onProgress) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `chatFiles/${roomId}/${timestamp}_${safeName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    );
  });
};

export const uploadAvatar = async (userId, file) => {
  const storageRef = ref(storage, `avatars/${userId}`);
  await uploadBytesResumable(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};
