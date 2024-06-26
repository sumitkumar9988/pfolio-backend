const mongoose = require("mongoose");

const workExperienceSchema = new mongoose.Schema({
  jobTitle: {
    type: "string",
    required: [true, "Enter tittle of work experience"],
  },
  profile: {
    type: mongoose.Schema.ObjectId,
    ref: "Profile",
  },
  organization: {
    type: String,
    required: [true, "Enter your organization Name"],
  },
  logo: {
    type: String,
    default:
      "https://firstletter-multimedia.s3.ap-south-1.amazonaws.com/company.png",
  },
  website: String,
  startDate: String,
  endDate: String,
  duration: Number,
});

const Experience = mongoose.model("Experience", workExperienceSchema);

module.exports = Experience;
