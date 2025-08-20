const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const { setGlobalOptions } = require("firebase-functions/v2");

// Configura la región para tus funciones
setGlobalOptions({ region: "europe-west1" });

admin.initializeApp();
const db = admin.firestore();

// Esta es la nueva forma de definir una función programada con v2
exports.obtenerPartidosAutomaticamente = onSchedule("every day 05:00", async (event) => {
  logger.info("Ejecutando la función para obtener partidos...");

  // ¡IMPORTANTE! Reemplaza esto con los IDs reales de TheSportsDB para tus equipos
  // Ejemplo: ["133604", "133739", "133610"] para Real Madrid, Barça, Atlético
  const idsDeTusEquipos = ["137445", "149354", "ID_EQUIPO_3"]; 
  const apiKey = process.env.THESPORTSDB_KEY;

  if (!apiKey) {
    logger.error("La clave de API de TheSportsDB no está configurada.");
    return;
  }
  
  for (const equipoId of idsDeTusEquipos) {
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${equipoId}`;
      const response = await axios.get(url);
      const partidos = response.data.events;

      if (partidos) {
        for (const partido of partidos) {
          const partidoId = partido.idEvent;
          const partidoRef = db.collection("partidos").doc(partidoId);

          const doc = await partidoRef.get();
          if (!doc.exists) {
            logger.info(`Nuevo partido encontrado, añadiendo: ${partido.strEvent}`);
            
            let deporte = "Desconocido";
            if(partido.strSport === "Soccer") deporte = "Fútbol";
            if(partido.strSport === "Basketball") deporte = "Baloncesto";
            if(partido.strSport === "Futsal") deporte = "Fútbol Sala";

            await partidoRef.set({
              deporte: deporte,
              equipoLocal: partido.strHomeTeam,
              equipoVisitante: partido.strAwayTeam,
              fecha: new Date(partido.strTimestamp + "Z"), // Añadimos 'Z' para asegurar que es UTC
              estado: "Pendiente",
              resultadoLocal: null,
              resultadoVisitante: null,
            });
          }
        }
      }
    } catch (error) {
      logger.error(`Error obteniendo partidos para el equipo ${equipoId}:`, error);
    }
  }
  logger.info("La función ha terminado de ejecutarse.");
});
const { onCall } = require("firebase-functions/v2/https");

// Esta función asigna un rol de admin a un usuario.
exports.setAdminRole = onCall(async (request) => {
  // IMPORTANTE: Pon aquí el UID de tu propia cuenta de usuario.
  const uid = "3r0fNYK1xcRpLVNo242n5miB8oA2"; 

  if (request.auth.uid !== uid) {
    logger.warn(`Intento no autorizado de ${request.auth.uid} para asignarse admin.`);
    return { message: "No tienes permiso para hacer esto." };
  }

  await admin.auth().setCustomUserClaims(uid, { admin: true });
  logger.info(`Rol de admin asignado correctamente al usuario ${uid}`);
  return { message: `¡Felicidades, ${uid}! Ahora eres administrador.` };
});