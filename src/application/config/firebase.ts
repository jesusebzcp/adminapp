import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getStorage, ref } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAM8ay8kNDSQflts1k9LmVwof1A_ywMR-E",
  authDomain: "supremefx-cbc26.firebaseapp.com",
  projectId: "supremefx-cbc26",
  storageBucket: "supremefx-cbc26.appspot.com",
  messagingSenderId: "697073001382",
  appId: "1:697073001382:web:408a50263c58cc7597a567",
  measurementId: "G-FWD6WE2DD1",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage, ref };
