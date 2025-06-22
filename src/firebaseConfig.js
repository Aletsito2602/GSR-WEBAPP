// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Importar getAuth
import { getFirestore } from "firebase/firestore"; // Importar Firestore si lo usaremos luego
import { getStorage } from "firebase/storage"; // Importar Storage para las imágenes
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// WARNING: Consider using environment variables for sensitive data like apiKey in production
const firebaseConfig = {
  apiKey: "AIzaSyBThM4WK6VNGYnbP8wPU3YLEbaLNQLSGBY",
  authDomain: "golden-suite-room-vgdl8z.firebaseapp.com",
  projectId: "golden-suite-room-vgdl8z",
  storageBucket: "golden-suite-room-vgdl8z.appspot.com",
  messagingSenderId: "202589345627",
  appId: "1:202589345627:web:90a8143703cf1178c22c7e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Configurar persistencia de sesión
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error al configurar persistencia:", error);
  });

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { auth, db, storage, app }; // Exportar auth, db, storage y app 