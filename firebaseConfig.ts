// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

// TODO: Add your Firebase project's configuration object here
// IMPORTANT: Replace the placeholder values below with your actual Firebase project config.
// You can find this in your Firebase project settings.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    // @ts-ignore
    app = null; // Ensure app and auth are null or handle appropriately
    // @ts-ignore
    auth = null;
    // Potentially show a global error message to the user
    alert("Could not initialize Firebase. Please check your configuration and ensure you have replaced the placeholder values in firebaseConfig.ts.");
}


export { app, auth };
