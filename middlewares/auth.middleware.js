//packages
let jwt = require("jsonwebtoken")

//local imports
let JWT_SECRET_KEY_1 = process.env.JWT_SECRET_KEY_1;
let BlackListedToken = require("../models/blackListedToken.model.js")
let UserModel = require("../models/users.model.js")

//middleware for checking if the user as authenticated or not
async function authenticate(req,res,next) {
    try {
         // Extracting the token from req.headers
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
         // checking if the above token is blackListed or not
         let blackListedToken = await BlackListedToken.findOne({token});
         // if exits, sending res, as User logged out, please login
         if(blackListedToken) {
             return res.status(401).json({message:"User logged out, please login"})
         }
         // Verifying token
         jwt.verify(token, JWT_SECRET_KEY_1, async (err, decoded)=>{
             // Error handling
             if (err) {
                 return res.status(401).send("User not authenticated, please login");
             }
             // If token is decoded - move forward
             if (decoded) {
                 let user = await UserModel.findOne({_id:decoded.userId})
                 req.body.user = user;
                 next(); 
             }
         });
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error})
    }
}

// Middleware for role based access
 function authorize (permittedRoles) {
    return async(req,res,next)=>{
     //destructuring the value from the req.body
     let {roles,_id} = req.body.user;
        try {
          let hasPermission = roles.some((role)=> permittedRoles.includes(role));
          //checking if permitted roles have permissions
          if(hasPermission) {
            req.body._id = _id;
            next()
          }else{
            res.status(307).json({message:"User is not authorized to access this endpoint"})
          }
        } catch (error) {
            console.log(error)
            res.status(500).json({message:error})
        }
    }
 }



//exporting the middlewares
module.exports = {authenticate,authorize}