// Schemas/Books.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
   
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner', // Reference to OwnerModel
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required: true
    },
    coverImage: {
        type: String, // Path to uploaded cover image
        required: true
    }},{ timestamps: true  });

const BookModel = mongoose.model('Book', BookSchema);
module.exports = BookModel;
