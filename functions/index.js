const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Esta función se ejecutará automáticamente todos los días a las 5 AM
exports.obtenerPartidosAutomaticamente = functions.pubsub.schedule("every day 05:00")
  .timeZone("Europe/Madrid")
  .onRun(async (context) => {
    console.log("Ejecutando la función para obtener partidos...");

    // ¡IMPORTANTE! Reemplaza esto con los IDs reales de TheSportsDB para tus equipos
    const idsDeTusEquipos = ["133604", "133739", "133610"]; // Ejemplo: Real Madrid, FC Barcelona, Atlético Madrid
    const apiKey = functions.config().thesportsdb.key; // Usamos una variable de entorno segura

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
              console.log(`Nuevo partido encontrado, añadiendo: ${partido.strEvent}`);
              
              let deporte = "Desconocido";
              if(partido.strSport === "Soccer") deporte = "Fútbol";
              if(partido.strSport === "Basketball") deporte = "Baloncesto";
              if(partido.strSport === "Futsal") deporte = "Fútbol Sala";

              await partidoRef.set({
                deporte: deporte,
                equipoLocal: partido.strHomeTeam,
                equipoVisitante: partido.strAwayTeam,
                fecha: new Date(partido.strTimestamp),
                estado: "Pendiente",
                // Guardamos los marcadores iniciales como null
                resultadoLocal: null,
                resultadoVisitante: null,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error obteniendo partidos para el equipo ${equipoId}:`, error);
      }
    }
    console.log("La función ha terminado de ejecutarse.");
    return null;
  });