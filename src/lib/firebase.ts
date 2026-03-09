import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuffkpaBMRrbytRlWrmPRCgBorJKixL6M",
  authDomain: "finthesia-3545d.firebaseapp.com",
  projectId: "finthesia-3545d",
  storageBucket: "finthesia-3545d.firebasestorage.app",
  messagingSenderId: "82556317420",
  appId: "1:82556317420:web:c88e3cdf6bceddf949ffc9",
  measurementId: "G-Z8TM4PXTVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
