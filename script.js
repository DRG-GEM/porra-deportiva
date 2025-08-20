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

let currentUser = null; // Variable para guardar el estado del usuario actual

// --- LÓGICA DE LA APLICACIÓN ---

// Función para guardar la predicción de un usuario
async function guardarPrediccion(partidoId) {
    if (!currentUser) {
        alert("Debes iniciar sesión para guardar una predicción.");
        return;
    }

    const inputLocal = document.getElementById(`local-${partidoId}`);
    const inputVisitante = document.getElementById(`visitante-${partidoId}`);
    const boton = document.getElementById(`btn-${partidoId}`);

    const prediccionLocal = inputLocal.value;
    const prediccionVisitante = inputVisitante.value;

    if (prediccionLocal === '' || prediccionVisitante === '') {
        alert("Por favor, introduce un resultado para ambos equipos.");
        return;
    }

    // Creamos un ID único para la predicción combinando el ID del partido y el del usuario
    const prediccionId = `${partidoId}_${currentUser.uid}`;

    try {
        // Guardamos la predicción en la colección "predicciones"
        await setDoc(doc(db, "predicciones", prediccionId), {
            userId: currentUser.uid,
            partidoId: partidoId,
            prediccionLocal: parseInt(prediccionLocal),
            prediccionVisitante: parseInt(prediccionVisitante),
            fecha: new Date() // Guardamos la fecha en que se hizo la predicción
        });

        // Damos feedback visual al usuario
        boton.textContent = "Predicción Guardada";
        boton.disabled = true;
        inputLocal.disabled = true;
        inputVisitante.disabled = true;

    } catch (error) {
        console.error("Error al guardar la predicción: ", error);
        alert("Hubo un error al guardar tu predicción. Inténtalo de nuevo.");
    }
}


// Función para mostrar los partidos
async function mostrarPartidos() {
    console.log("Buscando partidos en Firestore...");
    const partidosRef = collection(db, "partidos");
    const q = query(partidosRef, orderBy("fecha", "asc"));
    const querySnapshot = await getDocs(q);
    
    listaPartidosDiv.innerHTML = '';

    if (querySnapshot.empty) {
        listaPartidosDiv.innerHTML = '<p>No hay partidos programados.</p>';
        return;
    }

    querySnapshot.forEach((doc) => {
        const partido = doc.data();
        const partidoId = doc.id;
        const fecha = partido.fecha.toDate();
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Solo mostramos el formulario de predicción si el usuario está logueado y el partido está pendiente
        const formularioHTML = currentUser && partido.estado === 'Pendiente' ? `
            <div class="prediccion-form">
                <input type="number" min="0" id="local-${partidoId}" placeholder="Local">
                <span>-</span>
                <input type="number" min="0" id="visitante-${partidoId}" placeholder="Visitante">
                <button id="btn-${partidoId}">Guardar Predicción</button>
            </div>
        ` : '';

        const partidoHTML = `
            <div class="partido-card">
                <small>${partido.deporte} - ${fechaFormateada}</small>
                <h3>${partido.equipoLocal} vs ${partido.equipoVisitante}</h3>
                <p>Estado: ${partido.estado}</p>
                ${formularioHTML}
            </div>
        `;
        listaPartidosDiv.innerHTML += partidoHTML;
    });

    // Añadimos los event listeners a los botones después de crear el HTML
    querySnapshot.forEach((doc) => {
        const partido = doc.data();
        if (currentUser && partido.estado === 'Pendiente') {
            const partidoId = doc.id;
            const boton = document.getElementById(`btn-${partidoId}`);
            if(boton) {
                boton.addEventListener('click', () => guardarPrediccion(partidoId));
            }
        }
    });
}

// --- AUTENTICACIÓN DE USUARIOS ---
onAuthStateChanged(auth, (user) => {
    currentUser = user; // Actualizamos la variable global del usuario
    if (user) {
        userInfoDiv.innerHTML = `<p>Hola, ${user.displayName || user.email}</p><button id="logout-button">Cerrar Sesión</button>`;
        document.getElementById('logout-button').addEventListener('click', () => signOut(auth));
    } else {
        userInfoDiv.innerHTML = `<button id="login-button">Iniciar Sesión con Google</button>`;
        document.getElementById('login-button').addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider);
        });
    }
    // Volvemos a mostrar los partidos para que aparezcan/desaparezcan los formularios de predicción
    mostrarPartidos();
});