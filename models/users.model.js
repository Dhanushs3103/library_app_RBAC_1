// packages
let mongoose = require("mongoose");

//local imports

// user schema for registering the user.
let userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    roles: { 
        type: [String], 
        enum: ["creator", "viewer", "viewAll"],
        default: ["viewAll"], 
        required: true
    },
    booksCreated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Books",
        required:true
    }]
},{
    versionKey:false
});

// UserModel
let UserModel = mongoose.model("User", userSchema);

// exporting the UserModel
module.exports = UserModel;
