const Razorpay = require("razorpay");

exports.instance = new Razorpay({
	key_id: "rzp_test_t4LUM04KXw6wHc",
	key_secret: "DOdtPrjZRxQejIdj1vAzm0MY",
});



// exports.instance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET,
// })

// const RAZORPAY_KEY = "rz"

// const RAZORPAY_SECRET = "o7f"

// exports.instance = new Razorpay({
// 	key_id: RAZORPAY_KEY,
// 	key_secret: RAZORPAY_SECRET,
// });