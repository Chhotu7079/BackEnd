const User = require("../Model/User");
const mailSender = require("../Util/MailSender")
const bcrypt = require("bcrypt")
const crypto = require("crypto");

//reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req ki body
    const email = req.body.email
    //check user for this mail , email validation user hai ki nhi hai
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      })
    }
     //generate token
    const token = crypto.randomBytes(20).toString("hex")

    //update user byadding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    )
    console.log("DETAILS", updatedDetails)

    // const url = `http://localhost:3000/update-password/${token}`
    const url = `https://studynotion-edtech-project.vercel.app/update-password/${token}`
    //send mail containing the url
    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    )

    res.json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    })
  }
}


//reset password
exports.resetPassword = async (req, res) => {
  try {
     //data fetch kro
    const { password, confirmPassword, token } = req.body

     //validation check kro dono pwd mil rhe hai ki nhi
    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
    }
    //DB se user ki details nikalo token ke adhar pr
    const userDetails = await User.findOne({ token: token })
    //if no entry to envalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      })
    }
      //token ki time check kro
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      })
    }
     //hash password
    const encryptedPassword = await bcrypt.hash(password, 10)
    //update password
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    )
    res.json({
      success: true,
      message: `Password Reset Successful`,
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    })
  }
}
