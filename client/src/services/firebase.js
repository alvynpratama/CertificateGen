// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCblNX37UbY1ELPD3CUo_iToROX3fzeCB4",
  authDomain: "certificategen-82b92.firebaseapp.com",
  projectId: "certificategen-82b92",
  storageBucket: "certificategen-82b92.firebasestorage.app", // Hapus 'gs://' jika ada
  messagingSenderId: "14259156750",
  appId: "1:14259156750:web:aab16217c5d152f775095f",
  measurementId: "G-S57TYQDHJK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;