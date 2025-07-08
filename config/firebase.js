import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcETMDVJ5jPsylgfzq8g923fwE-eyTpss",
  authDomain: "caption-87353.firebaseapp.com",
  projectId: "caption-87353",
  storageBucket: "caption-87353.firebasestorage.app",
  messagingSenderId: "648449764513",
  appId: "1:648449764513:web:4634473daa91a08ecb14e0",
  measurementId: "G-XCE94PMYYW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
