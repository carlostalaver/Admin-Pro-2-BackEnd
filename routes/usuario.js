// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var UsuarioModelo = require('../models/usuario');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion')


// Inicializar variables
var app = express(); /* app es mi aplicacion express */

// Obtener todos los usuarios
app.get('/', (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  UsuarioModelo.find({}, 'nombre email img role google')
    .skip(desde)
    .limit(5) // para que entregue resultados de 5 en 5
    .exec(
      (err, usuarios) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Ocurrio un error cargando los usuarios de la BBDD',
            errors: err
          })
        }

        UsuarioModelo.count({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            usuarios,
            totalUsuarios: conteo
          })
        })

      })


})


// Crear un nuevo usuario
app.post('/', /*[mdAutenticacion.verificaToken],*/ (req, res, next) => {

  var body = req.body; // puede hacer esto porq tengo configurado el middleware body-parser, de lo contrario daria undefined

  var usuario = new UsuarioModelo({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10), //bcrypt.hashSync() usuado para encriptar el password
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioCreado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ocurrio un error al crear el usuario',
        errors: err
      })
    }
    res.status(201).json({
      ok: true,
      usuario: usuarioCreado,
      usuarioToken: req.usuario
    })
  })

})

// Actualizar usuario por id
app.put('/:id', [mdAutenticacion.verificaToken], (req, res, next) => {
  var id = req.params.id;

  UsuarioModelo.findById(id, (err, usuario) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      })
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar usuario',
        errors: { messaje: 'No existe un usuario con ese ID' }
      })
    }

    var body = req.body;
    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role
    usuario.img = (body.img!= null || body.img!= null) ? body.img : null;


    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: err
        })
      }
      usuarioGuardado.password = ':)'
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      })

    })

  })

})

// Eliminar un usuario
app.delete('/:id',[mdAutenticacion.verificaToken], (req, res, next) => {
  var id = req.params.id;
  UsuarioModelo.findByIdAndRemove(id , (err, usuarioEliminado) => {
    
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar usuario',
        errors: err
      })
    }
    if (!usuarioEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con el ID',
        errors: {messaje:'No existe el registro en BBDD'}
      })
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioEliminado
    })

  });

})

module.exports = app;