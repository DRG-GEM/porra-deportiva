// --- FASE 2: CONEXIÓN CON FIREBASE ---
// Importar las funciones que necesitamos de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// La configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBPKvV9IXP5Ptayct4t3DxCd36yfPiHf4U",
  authDomain: "porra-deportiva.firebaseapp.com",
  projectId: "porra-deportiva",
  storageBucket: "porra-deportiva.firebasestorage.app",
  messagingSenderId: "321093458886",
  appId: "1:321093458886:web:ed44b09be50520480630c7"
};

// Inicializar los servicios de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- FASE 3: AUTENTICACIÓN DE USUARIOS ---

// Obtenemos la referencia al div donde mostraremos la info del usuario
const userInfoDiv = document.getElementById('user-info');

// onAuthStateChanged es un "oyente" que se activa automáticamente
// cada vez que un usuario inicia o cierra sesión.
onAuthStateChanged(auth, (user) => {
  // Si 'user' existe, significa que el usuario ha iniciado sesión.
  if (user) {
    console.log("Usuario conectado:", user.email);
    // Mostramos un saludo y el botón de cerrar sesión
    userInfoDiv.innerHTML = `
      <p>Hola, ${user.displayName || user.email}</p>
      <button id="logout-button">Cerrar Sesión</button>
    `;

    // Añadimos la funcionalidad al botón de logout
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
      signOut(auth).then(() => {
        console.log("Sesión cerrada");
      }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
    });

  // Si 'user' no existe (es null), el usuario no ha iniciado sesión.
  } else {
    console.log("No hay usuario conectado.");
    // Mostramos el botón para iniciar sesión
    userInfoDiv.innerHTML = `
      <button id="login-button">Iniciar Sesión con Google</button>
    `;

    // Añadimos la funcionalidad al botón de login
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log("Inicio de sesión exitoso:", result.user.email);
        })
        .catch((error) => {
          console.error("Error al iniciar sesión:", error);
        });
    });
  }
});