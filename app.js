// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express(); /* app es mi aplicacion express */

// Configurar cabeceras y cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    // Set custom headers for CORS
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});


// Configuracion del middleware body-parser
app.use(bodyParser.urlencoded({extended: false})); // Toma todas las peticiones que llegan al servidor y convierte los datos en un objeto javascript
app.use(bodyParser.json());



// Conexion a la BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if(err)  throw err;
    console.log('\x1b[33m','Base de datos ','\x1b[0m', '\x1b[32m','online','\x1b[0m');
});


// Importar  Rutas
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital')
var medicoRoutes = require('./routes/medico')
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var appRoutes = require('./routes/app-routes');

//Middleware
app.use('/usuario', usuarioRoutes)
app.use('/login', loginRoutes)
app.use('/hospital', hospitalRoutes)
app.use('/medico', medicoRoutes)
app.use('/busqueda', busquedaRoutes)
app.use('/upload', uploadRoutes)
app.use('/img', imagenesRoutes)
app.use('/', appRoutes)


//#region usando  la libreria serve-index
 /*   var serveIndex = require('serve-index');
    app.use(express.static(__dirname + '/'));
    app.use('/uploads', serveIndex(__dirname + '/uploads')) */
//#endregion

// Escuchar peticiones
app.listen(3000, () => {
   console.log('\x1b[33m','Servidor express corriendo en el','\x1b[0m', '\x1b[32m','puerto 3000 online','\x1b[0m');
}) 