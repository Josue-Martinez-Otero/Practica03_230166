const express = require('express');
const session = require('express-session');

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

app.get('/login/:User',(req,res)=>{
  req.session.User=req.params.User;
  res.send("Usuario guardado");
})

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

// Ruta para cerrar la sesión
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send(`<h1>Error al cerrar la sesión.</h1>`);
    }
    res.send(`<h1>Sesión cerrada exitosamente</h1>`);
  });
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log(`Servidor corriendo en el puerto 3000`);
});
