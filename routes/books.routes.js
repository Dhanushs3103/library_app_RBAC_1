//packages
let express = require("express");
let jwt = require("jsonwebtoken");
let mongoose = require("mongoose")

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
      res.status(500).json({ message: error });
    }
  }
);

//Endpoint to view books created by the creator
booksRouter.get("/view-books",[authenticate, authorize(["viewer"])],async (req,res)=>{
    try {
      //getting the viewer Id from the middleware req.body
      let { _id } = req.body;
      // fetching the books with the authorId
      let books = await BookModel.find({authorId:_id})
      // checking if books not exits with this authorId
      if(books.length<=0) {
        return res.status(404).json({message:"Author doesn't have any collection of books"})
      }
      // if books are present, sending the data
      res.status(200).json({
        message:"Data received successfully",
        data:books
      })
    } catch (error) {
      res.status(500).json({message:error})
    }
})

//Endpoint to view all the books in DB
booksRouter.get("/view-all-books",[authenticate,authorize(["creator","viewer","viewAll"])],async(req,res)=>{
  try {
    //Fetching all the books from the data base,
    let books = await BookModel.find();
    // Sending response with data.
    res.status(200).json({
      message:"Data received successfully",
      data: books
    })
  } catch (error) {
    res.status(500).json({message:error})
  }
})

//Endpoint to update the books details [put request]
booksRouter.put("/update-book/:id",[authenticate,authorize(["creator"])],async (req,res)=>{
  try {
    //destructuring the creator id from the middleware
    let {_id} = req.body
    // finding the creator with his id
    // let creator = await 
    //destructuring the id from req.params
    let {id} = req.params
    //destructuring the newData from req.body
    let {title,genre,pages} = req.body;
    //checking if the provided id is a valid mongoDB id or not,
    if(!mongoose.Types.ObjectId.isValid(id)){
      console.log(3);
      return res.status(400).json({message:"Id is not a valid id"})
    }
    //checking if their is any book present with this Id
    let book = await BookModel.findById(id);
    if(!book) return res.status(404).json({message:"Book with the provided id doesn't exits"})
    //updating the book
    // let newBook = await BookModel({
    //   title,
    //   genre,
    //   pages,

      
    // })
    //if exits -
    // let newBookDetails = await BookModel.findByIdAndUpdate({_id:id},)
    res.status(200).json({message:"ok working"})
  } catch (error) {
    console.log(2);
    console.log(error)
    res.status(500).json({message:error})
  }
})

//Endpoint to update the books details [patch request]
booksRouter.patch("/update-book/:id",[authenticate,authorize(["creator"])],async (req,res)=>{
  try {
    //destructuring the id from req.params
    //destructuring the data from req.body
    //checking if book with id provided exits or not
    //updating the new data 
    //Sending response
  } catch (error) {
    res.status(500).json({message:error})
  }
})

//Endpoint to delete the books
booksRouter.delete("/delete-book/:id",[authenticate,authorize(["creator"])],async (req,res)=>{
  try {
    //destructuring the id from req.params
    //destructuring the data from req.body
    //checking if book with id provided exits or not
    //deleting the book
    //Sending response
  } catch (error) {
    res.status(500).json({message:error})
  }
})

//exporting the booksRouter
module.exports = booksRouter;
