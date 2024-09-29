
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../Model/User");

dotenv.config();

//auth
exports.auth = async (req, res, next) => {
	try {
		//extract token
		const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");


		//if token missing then return response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		//verify the token
		try {
			
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			console.log(decode);
			 // Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			//verification me koi issue hai
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}
// If JWT is valid, move on to the next middleware or request handler
		
		next();
	} catch (error) {
		    // If there is an error during the authentication process
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};

//isStudent
exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		console.log(userDetails);

		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
