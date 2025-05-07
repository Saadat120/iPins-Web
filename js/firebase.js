// /js/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAtEqB16SLrTlLuviYqKgxWlSfYz1JOslc",
  authDomain: "ipins-1.firebaseapp.com",
  projectId: "ipins-1",
  storageBucket: "ipins-1.firebasestorage.app",
  messagingSenderId: "612876259194",
  appId: "1:612876259194:web:4870eba8f151d1266a10c3",
  measurementId: "G-QWZPNQ9VNN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth and firestore instances
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };