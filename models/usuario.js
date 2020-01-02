var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator"); // validador semiautomatico

var Schema = mongoose.Schema;

var rolesValidos = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre del usuario es requerido'] },
  email: { type: String, unique: true, required: [true, 'El email del usuario es requerido'] },
  password: { type: String, required: [true, 'El password del usuario es requerido'] },
  img: { type: String, required: false },
  role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
  google: {type: Boolean, default: false} // si es true significa que el usuario se creó usando la autenticacion de google
});

usuarioSchema.plugin(uniqueValidator, {message : '{PATH} El email debe ser unico..!'})
module.exports = mongoose.model('Usuario', usuarioSchema);