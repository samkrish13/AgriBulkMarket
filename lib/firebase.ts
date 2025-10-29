import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAS1FpVkL0x0mC3zLcX8HQZBWv5IBI-zb4",
  authDomain: "agrisupply-637ae.firebaseapp.com",
  projectId: "agrisupply-637ae",
  storageBucket: "agrisupply-637ae.firebasestorage.app",
  messagingSenderId: "194078456997",
  appId: "1:194078456997:web:6635dadc610abcc263614c",
  measurementId: "G-6Z0KE1VF9R"
};
// This prevents build-time errors when env vars are not set
let app: any = null
let auth: any = null
let db: any = null
let storage: any = null

if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

export { app, auth, db, storage }
