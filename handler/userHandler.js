const User = require("./../models/userModel");
const Education = require("./../models/educationModel");
const Profile = require("./../models/profileModel");
const Experience = require("./../models/experienceModel");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");

exports.uploadImage = catchAsync(async (req, res, next) => {
  const image = req.body.image;
  res.status(200).json({
    status: "success",
    url: image,
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getProfile = catchAsync(async (req, res, next) => {
  console.log(req.user);
  if (!req.user.profile) {
    return next(
      new AppError(
        "You don`t have any profile! Please create your profile",
        404
      )
    );
  }
  const profile = await Profile.findById(req.user.profile);
  if (!profile) {
    return next(
      new AppError(
        "You don`t have any profile! Please create your profile",
        404
      )
    );
  }
  res.status(200).json({
    status: "success",
    data: profile,
  });
});

exports.createProfile = catchAsync(async (req, res, next) => {
  const profile = await Profile.findById(req.user.profile);
  if (profile) {
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.user.profile,
      {
        name: req.body.name,
        photo: req.body.photo,
        username: req.body.username,
        bio: req.body.bio,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: updatedProfile,
    });
  }

  const newProfile = await Profile.create({
    user: req.user.id,
    name: req.body.name,
    email: req.user.email,
    photo: req.body.photo,
    username: req.body.username,
    bio: req.body.bio,
  });

  await User.findByIdAndUpdate(
    req.user.id,
    {
      profile: newProfile._id,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: "success",
    data: newProfile,
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const profile = await Profile.findById(req.user.profile);
  if (!profile || !req.user.profile) {
    return next(
      new AppError(
        "You don`t have any profile! Please create your profile",
        404
      )
    );
  }
  data = req.body;
  // const filteredBody = filterObj(
  //   data,
  //   "email",
  // );
  await Profile.findByIdAndUpdate(req.user.profile, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Profile details update successfully!",
  });
});

exports.deleteProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  await Profile.findByIdAndDelete(req.user.profile);
  user.profile = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    data: "Profile is Delete ",
  });
});

exports.getEducationDetail = catchAsync(async (req, res, next) => {
  const education = await Education.findById(req.params.id);
  if (!education) {
    return next(new AppError("No document found with that ID", 400));
  }
  res.status(201).json({
    status: "success",
    data: education,
  });
});

exports.getAllEducation = catchAsync(async (req, res, next) => {
  const education = await Education.find({
    profile: req.user.profile,
  });
  res.status(201).json({
    status: "success",
    length: education.length,
    data: education,
  });
});

exports.addEducation = catchAsync(async (req, res, next) => {
  const education = await Education.create({
    institute: req.body.institute,
    profile: req.user.profile,
    logo: req.body.image,
    degree: req.body.degree,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    course: req.body.course,
  });

  const profile = await Profile.findById(req.user.profile);
  console.log(education._id);
  profile.education.push(education._id);
  await profile.save();

  res.status(200).json({
    status: "success",
    message: "New Education Added ",
  });
});

exports.deleteEducation = catchAsync(async (req, res, next) => {
  const education = await Education.findById(req.params.id);
  if (!education) {
    return next(new AppError("No education found with that ID", 400));
  }
  if (String(req.user.profile) !== String(education.profile)) {
    return next(
      new AppError("You are not authorize to delete this item!", 400)
    );
  }
  await Education.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    message: "Education delete success",
  });
});

exports.updateEducation = catchAsync(async (req, res, next) => {
  const education = await Experience.findById(req.params.id);
  if (!education) {
    return next(new AppError("No education found with that ID", 400));
  }
  if (String(req.user.profile) !== String(education.profile)) {
    return next(
      new AppError("You are not authorize to delete this item!", 400)
    );
  }
  await Education.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    message: "Education updated",
  });
});

exports.allUserExeprience = catchAsync(async (req, res, next) => {
  const experience = await Experience.find({
    profile: req.user.profile,
  });
  res.status(201).json({
    status: "success",
    length: experience.length,
    data: experience,
  });
});

exports.getExperienceById = catchAsync(async (req, res, next) => {
  const experience = await Experience.findById(req.params.id);
  if (!experience) {
    return next(new AppError("No such data availabe with this ID", 400));
  }
  res.status(201).json({
    status: "success",
    data: experience,
  });
});

exports.addExperience = catchAsync(async (req, res, next) => {
  const experience = await Experience.create({
    jobTitle: req.body.jobTitle,
    profile: req.user.profile,
    organization: req.body.organization,
    logo: req.body.image,
    website: req.body.website,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    duration: req.body.duration,
  });

  const profile = await Profile.findById(req.user.profile);
  profile.experience.push(experience._id);
  await profile.save();

  return res.status(200).json({
    status: "success",
    message: "new experience add successfully !",
  });
});

exports.deleteExperienceDetail = catchAsync(async (req, res, next) => {
  const exp = await Experience.findById(req.params.id);
  if (!exp) {
    return next(new AppError("No document found with that ID", 404));
  }

  if (String(req.user.profile) !== String(exp.profile)) {
    return next(
      new AppError("You are not authorize to delete this item!", 400)
    );
  }
  await Experience.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Item delete successfully",
  });
});

exports.updateExperience = catchAsync(async (req, res, next) => {
  const exp = await Experience.findById(req.params.id);
  if (!exp) {
    return next(new AppError("No document found with that ID", 404));
  }
  if (String(req.user.profile) !== String(exp.profile)) {
    return next(
      new AppError("You are not authorize to delete this item!", 400)
    );
  }
  await Experience.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: "success",
    message: "Experience details update successfully",
  });
});

exports.addSkills = catchAsync(async (req, res, next) => {
  const skill = req.body.skill;
  const user = await Profile.findById(req.user.profile);
  user.skills.push(skill);
  await user.save();
  return res.status(205).json({
    status: "success",
    message: "Skills add successfully",
  });
});

exports.removeSkills = catchAsync(async (req, res, next) => {
  const profile = await Profile.findById(req.user.profile);
  const index = profile.skills.indexOf(req.body.skill);

  if (index > -1) {
    profile.skills.splice(index, 1);
  }
  return res.status(205).json({
    status: "success",
    message:
      "skill remove from profile",
  });
});
