const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lineaSchema = new Schema({
    descripcion: String
});

const marcaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la marca es necesario']
    },
    tipo: {
        type: Schema.Types.ObjectId,
        ref: 'Tipo',
        required: [true, 'El tipo es necesario']
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

module.exports = mongoose.model('Marca', marcaSchema);