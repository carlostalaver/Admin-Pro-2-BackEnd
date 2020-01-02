// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion')
var MedicoModelo = require('../models/medico');



// Inicializar variables
var app = express(); /* app es mi aplicacion express */

// Obtener todos los medicos
app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);


  MedicoModelo.find({})
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec(
      (err, medicos) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Ocurrio un error cargando los medicos de la BBDD',
            errors: err
          })
        }
        MedicoModelo.count({}, (err, total) => {
          res.status(200).json({
            ok: true,
            medicos,
            totalMedicos: total
          })

        })
      })


})
// Obtener un medico por id
app.get('/:id', (req, res, next) => {

  const id = req.params.id;
  MedicoModelo.findById(id)
    .populate('usuario', 'nombre email img')
    .populate('hospital')
    .exec((err, medico) => {

      if (err) {
        return this.response.status(500).json({
          ok: false,
          mensaje: 'Error al buscar medico',
          errors: err
        })
      }

      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El medico con id ' + id + ' no existe',
          errors: {
            messge: 'No existe el medico con el ID indicado'
          }
        })
      }


      res.status(200).json({
        ok: true,
        medico: medico
      })

    })


})

// Crear un nuevo medico
app.post('/', [mdAutenticacion.verificaToken], (req, res, next) => {

  var body = req.body; // puede hacer esto porq tengo configurado el middleware body-parser, de lo contrario daria undefined

  var medico = new MedicoModelo({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoCreado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ocurrio un error al crear el medico',
        errors: err
      })
    }
    res.status(201).json({
      ok: true,
      medico: medicoCreado,
      usuarioToken: req.usuario
    })
  })

})

// Actualizar usuario por id
app.put('/:id', [mdAutenticacion.verificaToken], (req, res, next) => {
  var id = req.params.id;

  MedicoModelo.findById(id, (err, medico) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el medico',
        errors: err
      })
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar medico',
        errors: {
          messaje: 'No existe un medico con ese ID'
        }
      })
    }

    var body = req.body;
    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;


    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar medico',
          errors: err
        })
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      })
    })
  })
})

// Eliminar un usuario
app.delete('/:id', [mdAutenticacion.verificaToken], (req, res, next) => {
  var id = req.params.id;
  MedicoModelo.findByIdAndRemove(id, (err, medicoEliminado) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar medico',
        errors: err
      })
    }
    if (!medicoEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con el ID',
        errors: {
          messaje: 'No existe el registro en BBDD'
        }
      })
    }

    res.status(200).json({
      ok: true,
      medico: medicoEliminado
    })

  });

})

module.exports = app;