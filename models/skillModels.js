const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: [true, "Enter Skills you have"],
  },
  profile: {
    type: mongoose.Schema.ObjectId,
    ref: "Profile",
  },
  logo: {
    type: String,
  },
});

const Skill = mongoose.model("Skill", skillSchema);

module.exports = Skill;
