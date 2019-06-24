const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const Marca = require('./marca');
const Categoria = require('./categoria');

const imagenSchema = new Schema({
    id: {
        type: String
    },
    filename: {
        type: String
    },
    path: {
        type: String
    }
});

const productSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es necesario']
    },
    dimensiones: {
        type: String
    },
    nota: {
        type: String,
        required: false
    },
    cantidad: {
        type: Number,
        min: [1, 'Muy poco producto'],
        max: 1000,
        default: 0
    },
    estado: {
        type: Boolean,
        default: true
    },
    oferta: {
        type: Boolean,
        default: false
    },
    precio: {
        type: Number,
        required: false,
        default: 0
    },
    marca: {
        type: Schema.Types.ObjectId,
        ref: 'Marca',
        required: [true, 'Es necesario indicar la marca']
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: [true, 'Es necesario indicar la categoria']
    },
    img: [imagenSchema],
    creado: {
        type: Date,
        default: Date.now
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

productSchema.pre('save', function(next) {
    const product = this;
    Marca.findById(product.marca)
        .exec((err, data) => {
            if (err) {
                return next(err);
            }
            if (data === null) {
                product.marca = '5d024c7b29466943a0d75b0a'
                next();
            } else {
                next()
            }
        })
})

productSchema.pre('save', function(next) {
    const product = this;

    Categoria.findById(product.categoria)
        .exec((err, categoria) => {
            if (err) {
                return next(err);
            }
            if (categoria === null) {
                product.categoria = '5d027ed203f47135c0df010b'
                next();
            } else {
                next()
            }
        })

})


module.exports = mongoose.model('Product', productSchema);