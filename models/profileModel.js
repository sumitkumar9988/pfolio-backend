const mongoose = require("mongoose");
const validator = require("validator");

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    username: {
      type: String,
      lowercase: true,
      minlength: 3,
      maxlength: 12,
      unique: true,
      required: [true, "user name can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "username is invalid"],
      index: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    prooject: [{ type : mongoose.Schema.ObjectId, ref: 'Project' }], 
    education: [{ type : mongoose.Schema.ObjectId, ref: 'Education' }],
    experience: [{ type : mongoose.Schema.ObjectId, ref: 'Experience' }],
    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    profession: {
      type: String,
      enum: ["developer", "designer"],
    },
    gender: {
      type: String,
      enum: ["male", "female","other"],
    },

    photo: {
      type: String,
    },

    skills: {
      type: [String],
    },
    location: {
      type: String,
    },

    bio: {
      type: String,
      maxlength: [100, "length of bio should not be greater than 100 words"],
    },
    intrestedIn: {
      type: String,
    },

    twitterAcount: { type: String },
    facebookAccount: { type: String },
    linkedInAccount: { type: String },
    InstaAccount: { type: String },
    codeChefAccount: { type: String },
    gitHubAccount: { type: String },
    spojAccount: { type: String },
    mediumAccount: { type: String },
    dribbleAccount: { type: String },
    codeforcesAccount: { type: String },

    lookingForJob: {
      type: Boolean,
      default: true,
    },

    mobileNumber: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
