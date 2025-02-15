/*
    *CODE FLOW:-
1. Initialize Firebase storage connection
2. Create upload task with file and storage reference
3. Track upload progress, update percentage using callback
4. Handle errors during upload process
5. On complete, return downloadable file URL
*/

import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "jovial-acronym-450918-j6.firebaseapp.com",
  projectId: "jovial-acronym-450918-j6",
  storageBucket: "jovial-acronym-450918-j6.firebasestorage.app",
  messagingSenderId: "79929516579",
  appId: "1:79929516579:web:795524dc8492b89b964796",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFile(
  file: File,
  setProgress?: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadtask = uploadBytesResumable(storageRef, file);

      uploadtask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          if (setProgress) setProgress(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused.");
              break;
            case "running":
              // console.log(`Upload is running. ${progress}%`);
              break;
          }
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadtask.snapshot.ref).then((downloadUrl) => {
            resolve(downloadUrl as string);
          });
        },
      );
    } catch (error) {
      console.error(error);
    }
  });
}
