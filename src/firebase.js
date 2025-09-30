// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, serverTimestamp } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, //"AIzaSyC4cSjdX2sLKzqDoCFN8d7PVMwPCTRzn5Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, //"cricketcoach-a25c5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, //"cricketcoach-a25c5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,// "cricketcoach-a25c5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, //"165102725556",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,//"1:165102725556:web:199ff54db68700c68aaae1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,//"G-9XPSYD33RW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export { serverTimestamp };