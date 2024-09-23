// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mernblog-c01e3.firebaseapp.com",
  projectId: "mernblog-c01e3",
  storageBucket: "mernblog-c01e3.appspot.com",
  messagingSenderId: "161296749813",
  appId: "1:161296749813:web:4bb91701648a60355061bc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
