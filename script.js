// --- FASE 2: CONEXIÓN CON FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- REFERENCIAS A ELEMENTOS DEL HTML ---
const userInfoDiv = document.getElementById('user-info');
const listaPartidosDiv = document.getElementById('lista-partidos');


// --- FASE 4: MOSTRAR PARTIDOS ---

// Esta es una función "asíncrona", lo que le permite esperar a que Firebase responda.
async function mostrarPartidos() {
  console.log("Buscando partidos en Firestore...");
  // Preparamos la consulta: queremos los documentos de la colección "partidos", ordenados por fecha.
  const partidosRef = collection(db, "partidos");
  const q = query(partidosRef, orderBy("fecha", "asc"));

  // Ejecutamos la consulta
  const querySnapshot = await getDocs(q);
  
  // Vaciamos el contenido actual del div (el mensaje "Cargando...")
  listaPartidosDiv.innerHTML = '';

  if (querySnapshot.empty) {
    listaPartidosDiv.innerHTML = '<p>No hay partidos programados.</p>';
    return;
  }

  // Recorremos cada documento (partido) que hemos recibido
  querySnapshot.forEach((doc) => {
    const partido = doc.data();
    const partidoId = doc.id;

    // Convertimos la fecha de Firebase a un formato legible
    const fecha = partido.fecha.toDate();
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Creamos el HTML para la "tarjeta" del partido
    const partidoHTML = `
      <div class="partido-card">
        <small>${partido.deporte} - ${fechaFormateada}</small>
        <h3>${partido.equipoLocal} vs ${partido.equipoVisitante}</h3>
        <p>Estado: ${partido.estado}</p>
      </div>
    `;
    // Añadimos la tarjeta del partido al div
    listaPartidosDiv.innerHTML += partidoHTML;
  });
}


// --- FASE 3: AUTENTICACIÓN DE USUARIOS ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // ... (el código de login que ya teníamos)
    userInfoDiv.innerHTML = `<p>Hola, ${user.displayName || user.email}</p><button id="logout-button">Cerrar Sesión</button>`;
    document.getElementById('logout-button').addEventListener('click', () => signOut(auth));
  } else {
    // ... (el código de logout que ya teníamos)
    userInfoDiv.innerHTML = `<button id="login-button">Iniciar Sesión con Google</button>`;
    document.getElementById('login-button').addEventListener('click', () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider);
    });
  }
});

// --- INICIO DE LA APLICACIÓN ---
// Llamamos a la función para que se ejecute en cuanto cargue la página
mostrarPartidos();