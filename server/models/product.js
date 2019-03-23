const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es necesario']
    },
    marca: {
        type: String,
        required: [true, 'La marca es necesaria'],
    },
    linea: {
        type: String,
        required: [true, 'La linea es necesaria']
    },
    modelo: {
        type: String,
        required: [true, 'El modelo es necesario']
    },
    nota: {
        type: String,
        required: false
    },
    cantidad: {
        type: Number,
        required: false
    },
    estado: {
        type: Boolean,
        default: true
    },
    oferta: {
        type: Boolean,
        default: false
    },
    img: {
        type: String,
        required: false
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    creado: {
        type: Date,
        default: Date.now
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Product', productSchema);