// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAh_zyqugC_4KMh3tY0G8MJEMXVGMk0cnw",
  authDomain: "korpen-stats.firebaseapp.com",
  projectId: "korpen-stats",
  storageBucket: "korpen-stats.firebasestorage.app",
  messagingSenderId: "555012620632",
  appId: "1:555012620632:web:17cc558c0c2b6a568d652d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);