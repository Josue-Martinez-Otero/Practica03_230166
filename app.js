const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone'); 
const app = express();

// Configuración de la sesión
app.use(
  session({
    secret: 'p3-JAM#Pionero-sesionespersistentes', // Secreto para firmar la cookie de sesión
    resave: false,              // No resguarda la sesión si no ha sido modificada
    saveUninitialized: false,   // No guarda sesiones no inicializadas
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 horas  // Usar secure: true solo si usas HTTPS, maxAge permite definir la duración máxima de la sesión.
  })
);

app.get('/login/:user', (req, res) => {
  const nm = req.params.user; 
  if (!req.session.createdAt) {
    req.session.name = nm;
    req.session.createdAt = new Date();
    req.session.lastAcces = new Date();
    
    res.send(`La sesión ha sido iniciada para el usuario: ${nm}`);
  } else {
    res.send('Ya existe una sesión activa');
  }
});

// Ruta para actualizar la fecha de la última consulta
app.get('/update', (req, res) => {
  if (req.session.createdAt) {
    req.session.lastAcces = new Date();
    res.send('La fecha del último acceso ha sido actualizada');
  } else {
    res.send('No hay sesión activa');
  }
});

// Ruta para obtener el estado de la sesión 
app.get('/status', (req, res) => {
  if (req.session.createdAt) {
    const now = new Date();
    const started = new Date(req.session.createdAt);
    const lastUpdate = new Date(req.session.lastAcces);
    const name = req.session.name;

    // Calcular antigüedad de la sesión
    const sessionAgeMs = now - started;
    const hours = Math.floor(sessionAgeMs / (1000 * 60 * 60));
    const minutes = Math.floor(sessionAgeMs % (1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor(sessionAgeMs % (1000 * 60) / 1000);

    // Convertir las fechas al uso horario de CDMX
    const createdAT_MX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
    const lastAcces_MX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

    res.json({
      mensaje: 'Estado de la sesión',
      SessionId: req.sessionID,
      Usuario: name,
      inicio: createdAT_MX,
      ultimoAcceso: lastAcces_MX,
      antiguedad: `${hours} horas, ${minutes} minutos y ${seconds} segundos`,
      datos_sesion: { createdAt: createdAT_MX, lastAcces: lastAcces_MX, sessionAge: `${hours} horas, ${minutes} minutos y ${seconds} segundos`,
      }
    });
  } else {
    res.send('No hay una sesión activa');
  }
});

// Ruta para obtener todos los datos de la sesión 
app.get('/session', (req, res) => {
  if (req.session.createdAt) {
    const now = new Date();
    const started = new Date(req.session.createdAt);
    const lastUpdate = new Date(req.session.lastAcces);
    const name = req.session.name;

    // Calcular la duración de la sesión en segundos
    const sessionDuration = Math.floor((now - started) / 1000);

    // Convertir las fechas al uso horario de CDMX
    const createdAT_MX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
    const lastAcces_MX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

    res.send(`
      <h1>Detalles de la sesión</h1>
      <p><strong>Usuario:</strong> ${name}</p>
      <p><strong>ID sesión:</strong> ${req.sessionID}</p>
      <p><strong>Fecha de creación de la sesión:</strong> ${createdAT_MX}</p>
      <p><strong>Último acceso:</strong> ${lastAcces_MX}</p>
      <p><strong>Duración de la sesión (en segundos):</strong> ${sessionDuration}</p>
    `);
  } else {
    res.send(`<h1>No hay una sesión activa.</h1>`);
  }
});

// Ruta para cerrar la sesión
app.get('/logout', (req, res) => {
  if (req.session.createdAt) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error al cerrar sesión.');
      }
      res.send('Sesión cerrada exitosamente.');
    });
  } else {
    res.send('No hay una sesión activa para cerrar');
  }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
