const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tipoSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'La descri[on es obligatoria']
    },
    nota: {
        type: String
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

module.exports = mongoose.model('Tipo', tipoSchema);