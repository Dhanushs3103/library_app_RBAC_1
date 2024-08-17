//packages
let mongoose = require("mongoose");

let blackListedTokenSchema = mongoose.Schema({
    token:{
        type:String,
        required:true
    },
    blackListedAt:{
        type:Date,
        default:Date.now,
        required:true
    }
},{versionKey:false})

let BlackListedToken = mongoose.model("BlackListedToken",blackListedTokenSchema)

//exporting
module.exports = BlackListedToken;