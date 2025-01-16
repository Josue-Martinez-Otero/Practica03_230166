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


// Middleware para mostrar detalles de la sesión
app.use((req, res, next) => {
  if (req.session) {
    if (!req.session.createdAt) {
      req.session.createdAt = new Date(); // Fecha de creación de la sesión
    }
    req.session.lastAccess = new Date(); // Último acceso a la sesión
  }
  next();
});

//Ruta para inicializar la sesión
app.get('/login/:User',(req,res)=>{
  if(req.session.createdAt){
    req.session.User=req.params.User;
     req.session.createdAt = new Date();
     req.session.lastAccess = new Date();
     res.send('La sesión ha sido iniciada.');
  }else{
    res.send('Ya existe una sesión');
  }
});

//Ruta para actualizar la fecha de última consulta
app.get('/update', (req, res)=>{
  if(req.session.createdAt) {
    req.session.lastAccess = new Date();
    res.send('La fecha de último acceso ha sido actualizada.');
  }else {
    res.send('No hay una sesión activa.')
  }
});

//Ruta para obtener el estado de la sesión
app.get('/status', (req, res)=>{
  if(req.session.createdAt) {
    const User = req.session.User;
    const now = new Date()
    const started = new Date(req.session.createdAt);
    const lastUpdate = new Date(req.session.lastAccess);
  

 //Calcular la antiguedad de la sesión
 const sessionAgeMs = now - started;
        const hours = Math.floor(sessionAgeMs / (1000 * 60 * 60));
        const minutes = Math.floor((sessionAgeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((sessionAgeMs % (1000 * 60)) / 1000);

   // Convertir las fechas al huso horario de CDMX
   const createdAt_CDMX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
   const lastAcces_CDMX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');     
  res.json({
   mensaje: 'Estado de la sesión',
   user: req.session.User,
   sesionID: req.sessionID,
   inicio: createdAt_CDMX,
   ultimoAcceso: lastAcces_CDMX,
   antiguedad: `${hours} horas, ${minutes} minutos, ${seconds} segundos`
  });
  } else {
res.send('No hay una sesión activa.');
}
  
});

// Ruta para mostrar la información de la sesión
app.get('/session', (req, res) => {
  if (req.session) {
    const User = req.session.User;
    const sessionId = req.session.id;
    const createdAt = req.session.createdAt;
    const lastAccess = req.session.lastAccess;
    const sessionDuration = (new Date() - new Date(createdAt))/1000; //Duración de la sesión en segundos
    console.log(`La duración de la sesión es de ${sessionDuration} segundos.`);

    res.send(`
      <h1>Detalles de la sesión</h1>
      <p><strong>Usuario:</strong>${User}</p>
      <p><strong>ID sesión:</strong> ${sessionId}</p>
      <p><strong>Fecha de creación de la sesión:</strong> ${createdAt.toLocaleString()}</p>
      <p><strong>Último acceso:</strong> ${lastAccess.toLocaleString()}</p>
      <p><strong>Duración de la sesión (en segundos):</strong> ${sessionDuration}</p>
    `);
  } else {
    res.send(`<h1>No hay una sesión activa.</h1>`);
  }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  if (req.session.createdAt) {
      req.session.destroy(err => {
          if (err) {
              return res.status(500).send('Error al cerrar sesión');
          }
          res.send('Sesión cerrada correctamente');
      });
  } else {
      res.send('No hay sesión activa para cerrar');
  }
});


// Iniciar el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en https://localhost:${PORT}`);
});
