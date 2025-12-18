// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// ⚠️ GANTI BAGIAN INI DENGAN CONFIG DARI FIREBASE CONSOLE ANDA ⚠️
const firebaseConfig = {
    apiKey: "AIzaSyBZckGXymW_c7JWUaHJkTISKiwUPuSi-B8",
    authDomain: "certificate-generator-d0960.firebaseapp.com",
    projectId: "certificate-generator-d0960",
    storageBucket: "certificate-generator-d0960.firebasestorage.app",
    messagingSenderId: "766903866608",
    appId: "1:766903866608:web:5b1a22ad6fdb014c2cde35",
    measurementId: "G-X85RWZ7F7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth & Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };

