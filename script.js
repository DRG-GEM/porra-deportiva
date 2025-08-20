// --- CONEXIÓN CON FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

let currentUser = null;
let userPredictions = new Map();

// --- LÓGICA DE LA APLICACIÓN ---

async function fetchUserPredictions(userId) {
    if (!userId) return;
    const q = query(collection(db, "predicciones"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    userPredictions.clear();
    querySnapshot.forEach((doc) => {
        const pred = doc.data();
        userPredictions.set(pred.partidoId, pred);
    });
    console.log("Predicciones del usuario cargadas:", userPredictions);
}

async function guardarPrediccion(partidoId) {
    if (!currentUser) { return alert("Debes iniciar sesión para guardar una predicción."); }
    const inputLocal = document.getElementById(`local-${partidoId}`);
    const inputVisitante = document.getElementById(`visitante-${partidoId}`);
    const boton = document.getElementById(`btn-${partidoId}`);
    const prediccionLocal = inputLocal.value;
    const prediccionVisitante = inputVisitante.value;
    if (prediccionLocal === '' || prediccionVisitante === '') { return alert("Por favor, introduce un resultado para ambos equipos."); }
    const prediccionId = `${partidoId}_${currentUser.uid}`;
    try {
        await setDoc(doc(db, "predicciones", prediccionId), {
            userId: currentUser.uid,
            partidoId: partidoId,
            prediccionLocal: parseInt(prediccionLocal),
            prediccionVisitante: parseInt(prediccionVisitante),
            fecha: new Date()
        });
        boton.textContent = "Predicción Guardada";
        boton.disabled = true;
        inputLocal.disabled = true;
        inputVisitante.disabled = true;
    } catch (error) { console.error("Error al guardar la predicción: ", error); }
}

async function mostrarPartidos() {
    console.log("--- Iniciando mostrarPartidos ---");
    console.log("Valor de 'currentUser' al iniciar mostrarPartidos:", currentUser);

    const partidosRef = collection(db, "partidos");
    const q = query(partidosRef, orderBy("fecha", "asc"));
    const querySnapshot = await getDocs(q);
    listaPartidosDiv.innerHTML = '';

    if (querySnapshot.empty) { return listaPartidosDiv.innerHTML = '<p>No hay partidos programados.</p>'; }

    querySnapshot.forEach((doc) => {
        const partido = doc.data();
        const partidoId = doc.id;
        const fecha = partido.fecha.toDate();
        const fechaFormateada = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let formularioHTML = '';
        const prediccionExistente = userPredictions.get(partidoId);

        console.log(`Procesando partido: ${partido.equipoLocal}`);
        console.log(` -> ¿Hay usuario logueado? (currentUser !== null):`, !!currentUser);
        console.log(` -> ¿El partido está pendiente?:`, partido.estado === 'Pendiente');
        
        if (currentUser && partido.estado === 'Pendiente') {
            console.log(" -> Condición CUMPLIDA para mostrar algo.");
            if (prediccionExistente) {
                formularioHTML = `<div class="prediccion-guardada"><p>Tu predicción: <strong>${prediccionExistente.prediccionLocal} - ${prediccionExistente.prediccionVisitante}</strong> (Guardada)</p></div>`;
            } else {
                formularioHTML = `<div class="prediccion-form"><input type="number" min="0" id="local-${partidoId}" placeholder="Local"><span>-</span><input type="number" min="0" id="visitante-${partidoId}" placeholder="Visitante"><button id="btn-${partidoId}">Guardar Predicción</button></div>`;
            }
        } else {
            console.log(" -> Condición NO CUMPLIDA. No se mostrará formulario.");
        }

        const partidoHTML = `<div class="partido-card"><small>${partido.deporte} - ${fechaFormateada}</small><h3>${partido.equipoLocal} vs ${partido.equipoVisitante}</h3><p>Estado: ${partido.estado}</p>${formularioHTML}</div>`;
        listaPartidosDiv.innerHTML += partidoHTML;
    });

    querySnapshot.forEach((doc) => {
        const partido = doc.data();
        if (currentUser && partido.estado === 'Pendiente' && !userPredictions.has(doc.id)) {
            const partidoId = doc.id;
            const boton = document.getElementById(`btn-${partidoId}`);
            if (boton) { boton.addEventListener('click', () => guardarPrediccion(partidoId)); }
        }
    });
}

// --- AUTENTICACIÓN DE USUARIOS ---
onAuthStateChanged(auth, async (user) => {
    console.log("--- onAuthStateChanged se ha disparado ---");
    console.log("El objeto 'user' que ha llegado es:", user ? user.email : "null");

    currentUser = user;
    if (user) {
        userInfoDiv.innerHTML = `<p>Hola, ${user.displayName || user.email}</p><button id="logout-button">Cerrar Sesión</button>`;
        document.getElementById('logout-button').addEventListener('click', () => signOut(auth));
        await fetchUserPredictions(user.uid);
    } else {
        userInfoDiv.innerHTML = `<button id="login-button">Iniciar Sesión con Google</button>`;
        document.getElementById('login-button').addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider);
        });
        userPredictions.clear();
    }
    mostrarPartidos();
});