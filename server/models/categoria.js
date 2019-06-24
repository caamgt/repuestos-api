const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Es necesario el nombre de la categoria']
    },
    descripcion: {
        type: String,
        required: false
    },
    estado: {
        type: Boolean,
        default: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    creado: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Categoria', categoriaSchema);