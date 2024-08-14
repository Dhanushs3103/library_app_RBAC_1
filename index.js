// packages
let dotenv = require("dotenv").config();
let express = require("express")

// local imports
let PORT = parseInt(process.env.PORT,10);
let connection = require("./config/db.connect.js")

// initializing the server
let app = express();

// middlewares
app.use(express.json());

//Home route for the sever
app.get("/",(req,res)=>{
    res.status(200).send("Server is running fine")
})

// listening to the server
app.listen(PORT,async()=>{
    try {
        await connection;
        console.log(`Server is running at PORT: ${PORT} and connected to the DB`)
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error")
    }
})