import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAqdfXAcsQ9aSX9L_l7vjppwjHBnPGWlvw",
  authDomain: "dbsnake-c38c1.firebaseapp.com",
  projectId: "dbsnake-c38c1",
  storageBucket: "dbsnake-c38c1.firebasestorage.app",
  messagingSenderId: "389792895057",
  appId: "1:389792895057:web:8f7c8ab99751369b806870"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore y lo exporta
const db = getFirestore(app);

export { app, db };
