// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-CuHBxPR-RRhg9O6hgllROWN7Mo_jSv0",
  authDomain: "tictactoe-shift-46eca.firebaseapp.com",
  projectId: "tictactoe-shift-46eca",
  storageBucket: "tictactoe-shift-46eca.appspot.com",
  messagingSenderId: "1077611647490",
  appId: "1:1077611647490:web:dd7df066a0ad130ea8cd1b",
  measurementId: "G-KM5G0Y0KCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);