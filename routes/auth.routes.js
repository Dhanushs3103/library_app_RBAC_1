//packages
let express = require("express");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");

//local imports
let JWT_SECRET_KEY_1 = process.env.JWT_SECRET_KEY_1;
let JWT_SECRET_KEY_2 = process.env.JWT_SECRET_KEY_2;
let SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);
let UserModel = require("../models/users.model.js");
let BlackListedToken = require("../models/blackListedToken.model.js")
let {authenticate} = require("../middlewares/auth.middleware.js")

//parent Router
let authRouter = express.Router();

//function to generate accessToken
function generateAccessToken(payload,duration) {
  try {
      return jwt.sign(payload, JWT_SECRET_KEY_1, duration);
  } catch (error) {
      console.error("Error generating access token:", error);
      return null;
  }
}

// function to generate refreshToken
function generateRefreshToken(payload) {
  try {
      return jwt.sign(payload,JWT_SECRET_KEY_2, { expiresIn: "12h" });
  } catch (error) {
      console.error("Error generating refresh token:", error);
      return null;
  }
}

//Endpoint to register the user
authRouter.post("/register", async (req, res) => {
  try {
    // destructuring the req.body
    let { userName, age, email, password, roles } = req.body;
    // finding if the user already registered or not
    const user = await UserModel.find({ userName });
    //if present - sending res as user already registered please login
    if (user.length > 0) {
      return res.status(307).json({ message: "user already registered, please login." });
    }
    //checking if the role as value of "creator" - if found adding "viewer" role to it.
    if(roles.includes("creator")) {
        roles.push("viewer")
    }
    //Hashing the password before storing in the DB
    bcrypt.hash(password, SALT_ROUNDS, async (err, hash) => {
      try {
        if (err) {
          res.status(500).json({ message: err });
        }
        // If not present - Registering the new user
        const newUser = await new UserModel({
          userName,
          password: hash,
          age,
          email,
          roles:roles,
          booksCreated:[]
        });
        //saving the user to DB
        await newUser.save();
        //sending the response as user registered successfully
        res.status(201).json({ message: "User Registered Successfully" });
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

//Endpoint for user login
authRouter.post("/login", async(req,res)=>{
  try {
    //destructuring the req.body
    let {email,password} = req.body;
    // checking if user exits with this email
    let user = await UserModel.findOne({email});
    // if user not exits-
    if(!user) return res.status(401).json({message:"User not found"})      
    //if exits-
    bcrypt.compare(password,user.password,async (err,result)=>{
      try {
        //if error exits-
        if(err) {
          res.status(500).json({message:err})
        }
        //if result exits
        if(result){
           //generating the tokens
           let accessToken = generateAccessToken({userId: user._id.toString()},{expiresIn:"15m"});
           let refreshToken = generateRefreshToken({userId: user._id.toString()})
           //Checking if token exits or not
           if (!accessToken || !refreshToken) {
             return res.status(500).json({ message: "Error generating tokens" });
         }
          // Setting tokens as headers
          res.header({
           "Authorization": `Bearer ${accessToken}`,
           "X-Refresh-Token": `Bearer ${refreshToken}`
          })
          //sending response as login successful
          res.status(200).json({message:"login successful",})
        }else{
          res.status(400).json({message:"Wrong credentials"})
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({message:error})    
      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({message:error})
  }
})


// Endpoint for getting new Authorization token
authRouter.get("/get-token", async (req,res)=>{
  try {
     // Extracting the token from req.headers
     let authHeader = req.headers["x-refresh-token"];
     //checking if authHeaders are present
     if (!authHeader) {
         return res.status(401).send("refresh_token header missing");
     }
     //checking if token is present
     let token = authHeader.split(" ")[1];
     if (!token) {
         return res.status(401).send("Token not found");
     }

     // Verifying token
     jwt.verify(token, JWT_SECRET_KEY_2, function(err, decoded) {
         // Error handling
         if (err) {
             return res.status(401).send("User not authenticated, please login");
         }
         // If token is decoded - move forward
         if (decoded) {
           let newAccessToken = generateAccessToken({userId:decoded._id},{expiresIn:"12h"});
           //sending new token in headers 
           res.header({
            "Authorization": `Bearer ${newAccessToken}`
           }).status(201).send("New authorization token generated successfully")
         } 
     });
  } catch (error) {
    console.log(error);
    res.status(500).json({message:error})
  }
})

//Endpoint for logout
authRouter.post("/logout",authenticate,async(req,res)=>{
try {
  let authHeader = req.headers.authorization;
  //checking if authHeaders are present
  if (!authHeader) {
      return res.status(401).send("Access_token header missing");
  }
  //checking if token is present
  let token = authHeader.split(" ")[1];
  if (!token) {
      return res.status(401).send("Token not found");
  }
  //checking if token already being blackListed
  let tokenCheck = await BlackListedToken.findOne({token})
  if(tokenCheck) {
    return res.status(400).json({message:"Token already exits"})
  }
  // adding the token of the user to blackListedToken, so the user can't login again with same token.
  let newBlackListedToken = await BlackListedToken({token});
  // saving the token in the DB
  await newBlackListedToken.save();
  //sending the response
  res.status(200).json({message:"logged out successfully"})
} catch (error) {
  console.log(error);
  res.status(500).json({message:error})
  
}
})


//exporting the authRouter
module.exports = authRouter;



module.exports = authRouter;