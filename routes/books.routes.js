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
booksRouter.put("/update-book/:_id",[authenticate,authorize(["creator"])],async (req,res)=>{
  try {
    //destructuring the id from req.params
    let {_id} = req.params
    //destructuring the newData from req.body
    let {title,genre,pages} = req.body;
    //checking if the provided id is a valid mongoDB id or not,
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({message:"Id is not a valid mongoDB id"})
    }
    //checking if their is any book present with this Id
    let book = await BookModel.findById(_id);
    if(!book){
     return res.status(404).json({message:"Book with the provided id doesn't exits"})
    }
    //If exists - updating the book details
    book.title = title;
    book.genre = genre;
    book.pages = pages;
    //saving the book with new details
    await book.save()
    // sending successful response
    res.status(200).json({message:`Book with id ${id.toString()} successfully updated`})
  } catch (error) {
    console.log(2);
    console.log(error)
    res.status(500).json({message:error})
  }
})

//Endpoint to update the books details [patch request]
// booksRouter.patch("/update-book/:_id",[authenticate,authorize(["creator"])],async (req,res)=>{
//   try {
//     //getting the _id from the params
//     let _id = req.params._id
//     let newData = req.body
//     //checking if the provided id is a valid mongoDB id or not,
//     if(!mongoose.Types.ObjectId.isValid(_id)){
//       return res.status(400).json({message:"Id is not a valid mongoDB id"})
//     }
//     // checking if there is any book with this _id
//     let book = await BookModel.findById({_id});
//     if(!book) {
//       return res.status(404).json({message:"Book with this id doesn't exits"})
//     }
//     //updating the book
//     await BookModel.findByIdAndUpdate(_id,newData)
//     res.status(200).json({message:`Book with id ${_id.toString()} successfully updated`})
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({message:error})
//   }
// })

//Endpoint to delete the books
booksRouter.delete("/delete-book/:_id",[authenticate,authorize(["creator"])],async (req,res)=>{
  try {
    //destructuring the id from req.params
    let {_id} = req.params
    //checking if the provided id is a valid mongoDB id or not,
    if(!mongoose.Types.ObjectId.isValid(_id)){
      return res.status(400).json({message:"Id is not a valid mongoDB id"})
    }
    // checking if there is any book with this _id
    let book = await BookModel.findById({_id});
    if(!book) {
      return res.status(404).json({message:"Book with this id doesn't exits"})
    }
    //deleting the book
    await BookModel.findByIdAndDelete(_id)
    //Sending response
    res.status(200).json({message:`Book with id ${_id.toString()} successfully deleted`})
  } catch (error) {
    res.status(500).json({message:error})
  }
})

//exporting the booksRouter
module.exports = booksRouter;
