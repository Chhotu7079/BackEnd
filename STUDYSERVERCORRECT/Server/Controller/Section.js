const Section = require("../Model/Section");
const Course = require("../Model/Course");
const SubSection = require("../Model/SubSection");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;

     //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    //create section
    const newSection = await Section.create({ sectionName });

    //update section in course  with section objectid
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )//use populate to replace section/ subsection both in the updatedcourse details
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
 

    //return response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//update section
exports.updateSection = async (req, res) => {
  try {
      //data input
    const { sectionName, sectionId, courseId } = req.body;
    //data update karo
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    console.log(course);
    res.status(200).json({
      success: true,
      message: section,
      data: course,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//delete section
exports.deleteSection = async (req, res) => {
  try {
    //get id
    const { sectionId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });
    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    await SubSection.deleteMany({ _id: { $in: section.subSection } });

    await Section.findByIdAndDelete(sectionId);

    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
