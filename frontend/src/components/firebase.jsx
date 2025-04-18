// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL_Ke7VBn1y7j_faUjbpHjbNGsvzQ3EDc",
  authDomain: "login-auth-83417.firebaseapp.com",
  projectId: "login-auth-83417",
  storageBucket: "login-auth-83417.firebasestorage.app",
  messagingSenderId: "673723099028",
  appId: "1:673723099028:web:0045b65243ef8b17d89181"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export default app;