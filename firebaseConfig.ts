// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore"; // <-- AÑADIR ESTA LÍNEA

// TODO: Add your Firebase project's configuration object here
// IMPORTANT: Replace the placeholder values below with your actual Firebase project config.
// You can find this in your Firebase project settings.
/*const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};*/

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // <-- AÑADIR ESTA LÍNEA

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app); // <-- AÑADIR ESTA LÍNEA
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    // @ts-ignore
    app = null;
    // @ts-ignore
    auth = null;
    // @ts-ignore
    db = null; // <-- AÑADIR ESTA LÍNEA
    alert("Could not initialize Firebase. Please check your configuration and ensure you have replaced the placeholder values in firebaseConfig.ts.");
}
// Initialize Firebase
export { app, auth, db }; // <-- AÑADIR db A LA EXPORTACIÓN