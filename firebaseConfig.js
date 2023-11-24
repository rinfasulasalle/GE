const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyAf5oHZ-wxHucXdzVDni5kqE0pTSmSsQwQ",
  authDomain: "banco-9256c.firebaseapp.com",
  projectId: "banco-9256c",
  storageBucket: "banco-9256c.appspot.com",
  messagingSenderId: "763392638824",
  appId: "1:763392638824:web:c04923a553fc64830be0dd",
  measurementId: "G-CLEM6V7HX2",
  databaseURL: "https://banco-9256c-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);


module.exports = { app, db, realtimeDb };
