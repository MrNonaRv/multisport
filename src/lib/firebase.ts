import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdkUg7F-3rd028W8BbdTU9ZTki8-NESR0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "automatic-climate-zgxqk.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "automatic-climate-zgxqk",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "automatic-climate-zgxqk.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "557160494463",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:557160494463:web:61726a040bf3571277964a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, "ai-studio-multisportstourn-d9b21812-4785-4395-9200-73f03ac81dc4");
