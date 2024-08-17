//packages
let express = require("express");
let jwt = require("jsonwebtoken");

//local imports
let BookModel = require("../models/books.model.js");
let UserModel = require("../models/users.model.js");
let { authenticate, authorize } = require("../middlewares/auth.middleware.js");
let JWT_SECRET_KEY_1 = process.env.JWT_SECRET_KEY_1;

//parent router
let booksRouter = express.Router();

//Endpoint for adding a new book
booksRouter.post("/add-book",[authenticate, authorize(["creator"])],async (req, res) => {
    try {
      //getting the creator Id from the middleware req.body
      let { _id } = req.body;
      //destructuring the values sent in the post request
      let { title, genre, pages } = req.body;
      //checking if the book with the title exits or not
      let book = await BookModel.find({title});
      if(book.length >0){
        return res.status(409).json({message:"Book already exits with this title"})
      }
      // getting the author object using the id
      let bookCreator = await UserModel.findOne({ _id });
      // adding the book to the db
      let newBook = new BookModel({
        title,
        genre,
        pages,
        author: bookCreator.userName,
        authorId: bookCreator._id,
      });
      // saving the book to the DB
      await newBook.save();
      //adding Id of the book to the creators books collection
      bookCreator.booksCreated.push(newBook._id);
      await bookCreator.save(); // Save the updated user
      // Respond with the newly created book
      res.status(201).json({message:"new book created successfully"});
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error });
    }
  }
);

//exporting the booksRouter
module.exports = booksRouter;
