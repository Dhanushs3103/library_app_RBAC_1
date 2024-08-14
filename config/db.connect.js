//packages
let mongoose = require("mongoose")

//local imports
let MONGO_URL = process.env.MONGO_URL

//connecting the server with database
let connection = mongoose.connect(MONGO_URL);

// exporting the connections
module.exports = connection;