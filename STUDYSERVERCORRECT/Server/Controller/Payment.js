const { instance } = require("../Configuration/Razorpay");
const Course = require("../Model/Course");
const crypto = require("crypto");
const User = require("../Model/User");
const mailSender = require("../Util/MailSender");
const mongoose = require("mongoose");
const {
  courseEnrollmentEmail,
} = require("../Mail/Template/CourseEnrollmentEmail");
const { paymentSuccessEmail } = require("../Mail/Template/PaymentSuccessEmail");
const CourseProgress = require("../Model/CourseProgress");

//payment capture karni hai initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  //get course Id ANd userID
  const { courses } = req.body;
  const userId = req.user.id;
  //Validtaion 
  //Valid courseId hai ki nhi
  if (!courses.length) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }
  let total_amount = 0;
  for (const course_id of courses) {
    //Valid courseDetails hai ki nhi
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" });
      }
      //ek hi course ke liye dubara pay to nhi kr rha user -> user already pay for the same course ktaaaa
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnroled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }
      total_amount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  // order create 
  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    //initiate the payment using razopay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    res.json({// response return kr do
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;
  const userId = req.user.id;
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }
  let body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");
  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res);
    return res.status(200).json({ success: true, message: "Payment Verified" });
  }
  return res.status(200).json({ success: false, message: "Payment Failed" });
};


// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please Provide Course ID and User ID",
      });
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" });
      }
      console.log("Updated course: ", enrolledCourse);

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      console.log("Enrolled student: ", enrolledStudent);

      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log("Email sent successfully: ", emailResponse.response);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
};



//verify signature of razorpay and server

// exports.verifySignature = async (req, res) => {
//   const webhookSecret = "123456789";

//   const signature = req.headers["x-razorpay-signature"];

//   const shasum = crypto.createHmac("sha256", webhookSecret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   if(signature === digest){
//     console.log("Payment is Authorised");
//     const {courseId, userId} = req.body.payload.payment.entity.notes;

//     try{
//       //fulfil the action
//       //find the course and enroll the student in it
//       const enrolledCourse = await Course.findByIdAndUpdate(
//                                         {_id: courseId},
//                                         {$push:{studentsEnrolled: userId}},
//                                         {new:true},
//                                         );
     
//       if(!enrolledCourse){
//         return res.status(500).json({
//           success: false,
//           message: "Course not found",
//         });
//       }
//       console.log(enrolledCourse);

//       //find the student and add the course to their list enrolled courses me
//       const enrolledStudent = await User.findByIdAndUpdate(
//                                         {_id: userId},
//                                         {$push: {courses: courseId}},
//                                         {new:true},
//                                       );
//       console.log(enrolledStudent);

//       //mail send kro confirmation ka ki course kharid liya tumne badhai ho
//       const emailResponse = await mailSender(
//                                             enrolledStudent.email,
//                                             "Congratulation from SSIPMT",
//                                             "Congratulation, you are onboard into new SSIPMT Course",
//                                           );
//       console.log(emailResponse);
//       return res.status(200).json({
//         success:true,
//         message:"Signature verified and course added",
//       });
//     }catch(error){
//       console.log(error);
//       return res.status(500).json({
//         success: false,
//         message:error.message,
//       });
//     }
//   }else{
//     return res.status(400).json({
//       success:false,
//       message:"Invalid Payments"
//     })
//   }
// }
