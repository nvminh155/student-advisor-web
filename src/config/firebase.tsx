// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0DsGjmizVQizEiOUe4kMqpDCIx6IfmEU",
  authDomain: "m-o-plans.firebaseapp.com",
  databaseURL: "https://m-o-plans-default-rtdb.firebaseio.com",
  projectId: "m-o-plans",
  storageBucket: "m-o-plans.firebasestorage.app",
  messagingSenderId: "771337698600",
  appId: "1:771337698600:web:602fa22a5e91bea843e41d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export {db, auth}