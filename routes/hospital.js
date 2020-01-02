// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion')
var HospitalModelo = require('../models/hospital');



// Inicializar variables
var app = express(); /* app es mi aplicacion express */

// Obtener todos los Hospitales
app.get('/', (req, res, next) => {
  HospitalModelo.find({})
    .populate('usuario', 'nombre email role')
    .exec(
      (err, hospitales) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Ocurrio un error cargando los hospitales de la BBDD',
            errors: err
          })
        }

        HospitalModelo.count({}, (err, total) => {
          res.status(200).json({
            ok: true,
            hospitales,
            totalHospitales: total
          })
        })

      })


})

// Crear un nuevo hospital
app.post('/', [mdAutenticacion.verificaToken] , (req, res, next) => {

  var body = req.body; // puede hacer esto porq tengo configurado el middleware body-parser, de lo contrario daria undefined

  var hospital = new HospitalModelo({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalCreado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ocurrio un error al crear el hospital',
        errors: err
      })
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalCreado,
      usuarioToken: req.usuario
    })
  })

})

// Actualizar usuario por id
app.put('/:id', [mdAutenticacion.verificaToken], (req, res, next) => {
  var id = req.params.id;

  HospitalModelo.findById(id, (err, hospital) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el hospital',
        errors: err
      })
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar hospital',
        errors: { messaje: 'No existe un hospital con ese ID' }
      })
    }

    var body = req.body;
    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id


    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar hospital',
          errors: err
        })
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      })
    })
  })
})

// Eliminar un usuario
app.delete('/:id',[mdAutenticacion.verificaToken], (req, res, next) => {
  var id = req.params.id;
  HospitalModelo.findByIdAndRemove(id , (err, hospitalEliminado) => {
    
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar hospital',
        errors: err
      })
    }
    if (!hospitalEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con el ID',
        errors: {messaje:'No existe el registro en BBDD'}
      })
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalEliminado
    })

  });

})

// Obtener un hospital
app.get('/:id', (req, res) => {
  var id = req.params.id;
  HospitalModelo.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, hospital) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar hospital',
          errors: err
        });
      }
      if (!hospital) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El hospital con el id ' + id + ' no existe ',
            errors: {
              message: 'No existe un hospital con ese ID ' }
            });
        }
        res.status(200).json({
          ok: true,
          hospital: hospital
        });
    })
})

module.exports = app;