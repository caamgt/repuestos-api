const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lineaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la linea es necesario']
    },
    marca: {
        type: Schema.Types.ObjectId,
        ref: 'Marca',
        required: [true, 'La marca es necesaria']
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

module.exports = mongoose.model('Linea', lineaSchema);