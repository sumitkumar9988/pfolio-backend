const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  institute: {
    type: String,
    required: [true, "Enter your Institute Name"],
  },
  profile: {
    type: mongoose.Schema.ObjectId,
    ref: "Profile",
  },
  logo: {
    type: String,
    default:
      "https://firstletter-multimedia.s3.ap-south-1.amazonaws.com/university.png",
  },
  degree: String,
  course:String,
  startDate: String,
  endDate: String,
});

const Education = mongoose.model("Education", educationSchema);

module.exports = Education;
