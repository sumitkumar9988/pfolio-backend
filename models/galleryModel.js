const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.ObjectId,
    ref: "Profile",
  },
  tittle: {
    type: String,
  },
  images: {
    type: String,
  },
  date: {
    type: String,
  },
  description: {
    type: String,
  },
});

const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;
