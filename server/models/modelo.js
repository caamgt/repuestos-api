const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modeloSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripción del modelo es necesario']
    },
    linea: {
        type: Schema.Types.ObjectId,
        ref: 'Linea',
        required: [true, 'La linea del modelo es necesaria']
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

module.exports = mongoose.model('Modelo', modeloSchema);