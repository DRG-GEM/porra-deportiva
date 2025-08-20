// Paso 1: Importar las funciones que necesitamos de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Paso 2: La configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBPKvV9IXP5Ptayct4t3DxCd36yfPiHf4U",
  authDomain: "porra-deportiva.firebaseapp.com",
  projectId: "porra-deportiva",
  storageBucket: "porra-deportiva.firebasestorage.app",
  messagingSenderId: "321093458886",
  appId: "1:321093458886:web:ed44b09be50520480630c7"
};


// Paso 3: Inicializar los servicios de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mensaje de prueba para saber que todo ha ido bien
console.log("Firebase conectado correctamente!");
console.log("Servicio de Base de Datos (Firestore):", db);
console.log("Servicio de Autenticación (Auth):", auth);