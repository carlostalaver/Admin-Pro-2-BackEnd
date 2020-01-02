// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var UsuarioModelo = require('../models/usuario');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// Inicializar variables
var app = express();

// Autenticacion normal
app.post('/', (req, res) => {
  var body = req.body

  UsuarioModelo.findOne({ email: body.email }, (err, usuarioBD) => {


    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Ocurrio un error al buscar el usuario',
        errors: err
      })
    }

    if (!usuarioBD) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas -email',
        errors: err
      })
    }

    if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas -password',
        errors: err
      })
    }

    // Crear un token
    usuarioBD.password = ':)'
    var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14000 })

    res.status(200).json({
      ok: true,
      usuario: usuarioBD,
      token: token,
      id: usuarioBD._id
    })
  })
})


// Autenticacion con google
// para validar token de google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const tokenHARD = require('../config/config').token;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });


  const payload = ticket.getPayload();
  //const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}


app.post('/google', async (req, res, next) => {

  const token = req.body.token;

  const googleUser = await verify(token)
    .catch(err => {
      return res.status(403).json({
        ok: false,
        mensaje: 'Token no valido...!'
      })
    })

  UsuarioModelo.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario...!',
        errors: err
      })
    }

    if (usuarioDB) { 
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe autenticarse con credenciales de AdminPro, no con google SignIn',
        })
      } else {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      }
    } else {
      // el usuariono existe, hay que crearlo
      var usuarioNew = new UsuarioModelo();

      usuarioNew.nombre = googleUser.nombre;
      usuarioNew.email = googleUser.email;
      usuarioNew.img = googleUser.img;
      usuarioNew.google = true;
      usuarioNew.password =':)';

      usuarioNew.save((err, usuarioDB) => {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      })

    }
  })


})


// Rernovar Token
var middlewareAutenticacion = require('../middlewares/autenticacion');
app.get('/renuevatoken',middlewareAutenticacion.verificaToken ,(req, res, next) => {

  var token = jwt.sign({usuario: req.usuario}, SEED, {expiresIn: 14400})
  return res.status(200).json({
    ok: true,
    token: token
  })
})
module.exports = app;