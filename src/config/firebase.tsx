// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYvuG-omeeglBxscR_EmLgqZSfrgaY704",
  authDomain: "student-advisor-app-75a11.firebaseapp.com",
  projectId: "student-advisor-app-75a11",
  storageBucket: "student-advisor-app-75a11.firebasestorage.app",
  messagingSenderId: "331906216455",
  appId: "1:331906216455:web:cb2c0ecca79c29f72570a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export {db, auth}