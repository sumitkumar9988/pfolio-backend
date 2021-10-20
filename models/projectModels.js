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
    default: true,
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
      "https://res.cloudinary.com/sumit9988/image/upload/v1633450957/project_vumbkv.png",
  },
  repoUrl: {
    type: String,
  },
  tools: {
    type: [String],
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
