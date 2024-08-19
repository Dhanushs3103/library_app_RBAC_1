const mongoose = require("mongoose");

// book Schema for books
let bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    pages: {
        type: Number,
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Creating BookModel from bookSchema
let BookModel = mongoose.model("book", bookSchema);

// Exporting the BookModel
module.exports = BookModel;
