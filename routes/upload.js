// Requires
var express = require('express');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var UsuarioModelo = require('../models/usuario');
var MedicoModelo = require('../models/medico');
var HospitalModelo = require('../models/hospital');
// Inicializar variables
var app = express(); /* app es mi aplicacion express */

app.use(fileUpload());

app.put('/:categoria/:idUsuario', (req, res, next) => {

  var tipo = req.params.categoria;
  var id = req.params.idUsuario;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No seleccionó ningun archivo',
      errors: { messge: 'Debe seleccionar una imagen' }
    })
  }

  // Obtener nombre del archivo
  var nombreArchivo = req.files.imagen;
  var nombreCortado = nombreArchivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Extensiones permitidas
  var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg']
  var extensionValida = extencionesValidas.includes(String(extensionArchivo).toLowerCase());

  if (!extensionValida) {
    res.status(400).json({
      ok: false,
      mensaje: 'Extensión del archivo no permitida',
      errors: { message: `Las extensiones validas son : ${extencionesValidas.join(', ')}` }
    });
  }

  //Generar nombre de archivo custumised
  var nombreArchivoPersonalizado = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  var categoriasValidas = ['hospitales', 'usuarios', 'medicos'];

  if (!categoriasValidas.includes(tipo)) {
    res.status(400).json({
      ok: false,
      mensaje: 'Categoria no permitida',
      errors: { message: `Las categorias validas son : ${categoriasValidas.join(', ')}` }
    })
  } else {

    // mover el archivo del temporal a un directorio en especifico
    var path = `./uploads/${tipo}/${nombreArchivoPersonalizado}`;
    nombreArchivo.mv(path, (err) => {
      if (err) {
        res.status(500).json({
          ok: false,
          mensaje: 'Error al mover archivo',
          errors: err
        })
      }

      subirPorTipo(tipo, id, nombreArchivoPersonalizado, res)


    }); // end mv
  }// end else
})


function subirPorTipo(tipo, id, nombreArchivoPersonalizado, res) {
  if (tipo === 'usuarios') {
    UsuarioModelo.findById(id, (err, usuario) => {


      var pathViejo = `./uploads/usuarios/${String(usuario.img)}`

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al buscar el usuario en  la BBDD',
          errors: err
        })
      }

      if (!usuario) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Usuario no existe',
          errors: {message:'Usuario no existe en la BBDD'}
        })
      }
      // si existe una imagen previa la borro 
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo, (err) => {
          console.log('\x1b[33m', 'ocurrio un error', '\x1b[0m', '\x1b[32m', 'al eliminar archivo', '\x1b[0m', err);
        })
      }

      usuario.img = nombreArchivoPersonalizado;

      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ':)'
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de Usuario actualizada',
          usuarioActualizado
        });
      })

    })
  }

  if (tipo === 'medicos') {
    MedicoModelo.findById(id, (err, medico) => {


      var pathViejo = `./uploads/medicos/${String(medico.img)}`

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al buscar el medico en  la BBDD',
          errors: err
        })
      }
      if (!medico) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Medico no existe',
          errors: {message:'Medico no existe en la BBDD'}
        })
      }
      // si existe una imagen previa la borro 
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo, (err) => {
          console.log('\x1b[33m', 'ocurrio un error', '\x1b[0m', '\x1b[32m', 'al eliminar archivo', '\x1b[0m', err);
        })
      }

      medico.img = nombreArchivoPersonalizado;

      medico.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen del medico actualizada',
          medicoActualizado
        });
      })

    })
  }

  if (tipo === 'hospitales') {
    HospitalModelo.findById(id, (err, hospital) => {


      var pathViejo = `./uploads/medicos/${String(hospital.img)}`

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al buscar el hospital en  la BBDD',
          errors: err
        })
      }

      if (!hospital) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Hospital no existe',
          errors: {message:'Hospital no existe en la BBDD'}
        })
      }
      // si existe una imagen previa la borro 
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo, (err) => {
          console.log('\x1b[33m', 'ocurrio un error', '\x1b[0m', '\x1b[32m', 'al eliminar archivo', '\x1b[0m', err);
        })
      }

      hospital.img = nombreArchivoPersonalizado;

      hospital.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen del medico actualizada',
          hospitalActualizado
        });
      })

    })
  }
}
module.exports = app;