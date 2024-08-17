// packages
let dotenv = require("dotenv").config();
let express = require("express")
let cors = require("cors")
let morgan = require("morgan")

// local imports
let PORT = parseInt(process.env.PORT,10);
let connection = require("./config/db.connect.js");
let authRouter = require("./routes/auth.routes.js")
let booksRouter = require("./routes/books.routes.js")

// initializing the server
let app = express();

// middlewares
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }))
app.use(express.json());
app.use(morgan("combined"))
app.use("/auth",authRouter);
app.use("/books",booksRouter)

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