//auth , student, isAdmin

const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
  try{
    //extract jwt tokens
    const token = req.body.token;

    if(!token){
      return res.status(401).json({
        success: false,
        message: "Token Misssing",
      });
    }

    //verifythe token
    try{
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log(payload);

      //
      req.user = decode;
    }catch(e){
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  }catch(e){
    return res.status(401).json({
      success: false,
      message: "Something went wrong, while verifying the token",
    });
  }
}


exports.isStudent = (req, res, next) => {
  try{
    if(res.user.role !== "Student"){
      return res.status(401).json({
        success: false,
        message: "This is protected route for Student",
      });
    }
    next();
  }catch(e){
    return res.status(500).json({
      success: false,
      message: "User role is not matching",
    });
  }
}

exports.isAdmin = (req, res, next) => {
  try{
    if(res.user.role !== "Admin"){
      return res.status(401).json({
        success: false,
        message: "This is protected route for admin",
      });
    }
    next();
  }catch(e){
    return res.status(500).json({
      success: false,
      message: "User role is not matching",
    });
  }
}