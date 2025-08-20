// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBPKvV9IXP5Ptayct4t3DxCd36yfPiHf4U",
  authDomain: "porra-deportiva.firebaseapp.com",
  projectId: "porra-deportiva",
  storageBucket: "porra-deportiva.firebasestorage.app",
  messagingSenderId: "321093458886",
  appId: "1:321093458886:web:ed44b09be50520480630c7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Referencias a elementos del HTML
const appWrapper = document.getElementById('app-wrapper');
const form = document.getElementById('partidoForm');
const h1 = document.querySelector('h1');
const loadingMessage = document.getElementById('loading-message'); // Make sure this element exists in admin.html if you use it

// Comprobador de estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (loadingMessage) loadingMessage.style.display = 'none';

  if (user) {
    // Si el usuario está logueado, comprobamos si es admin
    user.getIdTokenResult().then(idTokenResult => {
      if (idTokenResult.claims.admin) {
        // ¡Es admin! Muestra el formulario.
        h1.textContent = `Bienvenido, Admin ${user.displayName}`;
        appWrapper.style.display = 'flex';
      } else {
        // No es admin, muestra acceso denegado.
        document.body.innerHTML = "<h1>Acceso Denegado</h1><p>No tienes permisos para ver esta página.</p>";
      }
    });
  } else {
    // Si no está logueado, MOSTRAMOS UN BOTÓN DE LOGIN
    document.body.innerHTML = `
      <div id="app-wrapper" style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
        <div class="container" style="text-align: center;">
          <h1>Panel de Admin</h1>
          <p>Debes iniciar sesión para continuar.</p>
          <button id="admin-login-button">Iniciar Sesión con Google</button>
        </div>
      </div>
    `;
    // Le damos funcionalidad a ESE botón
    document.getElementById('admin-login-button').addEventListener('click', () => {
      signInWithPopup(auth, new GoogleAuthProvider());
    });
  }
});

// Tu lógica de guardado
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const partido = {
        deporte: form.deporte.value,
        competicion: form.competicion.value,
        fecha: new Date(form.fecha.value),
        estado: form.estado.value,
        equipoLocal: form.equipoLocal_nombre.value,
        resultadoLocal: form.resultadoLocal.value ? Number(form.resultadoLocal.value) : null,
        equipoVisitante: form.equipoVisitante_nombre.value,
        resultadoVisitante: form.resultadoVisitante.value ? Number(form.resultadoVisitante.value) : null,
        origenDatos: "manual"
    };

    const docId = `${partido.deporte.toLowerCase().replace(/\s/g, '')}_${new Date(partido.fecha).getTime()}`;

    try {
        await setDoc(doc(db, "partidos", docId), partido);
        alert("¡Partido guardado con éxito!");
        form.reset();
    } catch (e) {
        console.error("Error al añadir documento: ", e);
        alert("Error al guardar el partido.");
    }
});