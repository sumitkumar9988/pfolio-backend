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
      "https://res.cloudinary.com/sumit9988/image/upload/v1633450956/college_sjwiqx.png",
  },
  degree: String,
  course:String,
  startDate: String,
  endDate: String,
});

const Education = mongoose.model("Education", educationSchema);

module.exports = Education;
