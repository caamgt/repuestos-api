const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subcategoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripción de la subcategoria es necesaria']
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Es necesario indicar la categoria de la subcategoria']
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

module.exports = mongoose.model('Subcategoria', subcategoriaSchema);