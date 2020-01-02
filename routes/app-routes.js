// Requires
var express = require('express');

// Inicializar variables
var app = express(); /* app es mi aplicacion express */

app.get('/', (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Petición ejecutada correctamente'
  })
})

module.exports = app;