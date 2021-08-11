const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.ObjectId,
    ref: "Profile",
  },
  name: {
    type: String,
  },
  included: {
    type: Boolean,
    default: false,
  },
  repoID: {
    type: Number,
  },
  images: {
    type: [String],
  },
  logo: {
    type: String,
    default:
      "https://firstletter-multimedia.s3.ap-south-1.amazonaws.com/projectIcon.png",
  },
  repoUrl: {
    type: String,
  },
  language: {
    type: String,
  },
  demoSample: {
    type: String,
  },
  license: String,
  DemoUrl: {
    type: String,
  },
  updated_at: {
    type: String,
  },
  description: {
    type: String,
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
