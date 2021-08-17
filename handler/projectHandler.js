const Project = require("./../models/projectModels");
const Profile = require("./../models/profileModel");
const Gallery = require("./../models/galleryModel");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const axios = require("axios");

exports.guthubOAoth = catchAsync(async (req, res, next) => {
  res.status("200").json({
    status: "success",
    redirect: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
  });
});

exports.githubCallBack = catchAsync(async (req, res, next) => {
  const requestToken = req.body.code;
  const { data } = await axios.post(
    `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_SECRET_KEY}&code=${requestToken}`
  );
  let access_token = data.split("&")[0];
  access_token = access_token.split("=")[1];

  const response = await axios.get(`https://api.github.com/user`, {
    headers: {
      Authorization: "token " + access_token,
    },
  });

  if (!response.data.login) {
    return next(new AppError("Some error occurred while GitHub OAuth", 404));
  }

  githubUserName = {
    gitHubAccount: response.data.login,
  };
  // console.log(githubUserName)
  await Profile.findByIdAndUpdate(req.user.profile, githubUserName, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    redirect: "/success",
    data: {
      username: response.data.login,
      name: response.data.name,
    },
  });
});

exports.getAllUserProject = catchAsync(async (req, res, next) => {
  const allProject = await Project.find({
    profile: req.user.profile,
  });

  res.status("200").json({
    status: "success",
    length: allProject.length,
    data: {
      projects: allProject,
    },
  });
});

exports.refreshNewProject = catchAsync(async (req, res, next) => {
  const user = await Profile.findById(req.user.profile);
  if (!user.gitHubAccount) {
    return next(new AppError("Please provide your GitHub account", 404));
  }

  const { data } = await axios.get(
    `https://api.github.com/users/${user.gitHubAccount}/repos`
  );
  let projects = data.map((item, index) => {
    return {
      profile: req.user.profile,
      name: item.name,
      repoID: item.id,
      repoUrl: item.url,
      DemoUrl: item.html_url,
      logo: "https://firstletter-multimedia.s3.ap-south-1.amazonaws.com/projectIcon.png",
      updated_at: item.updated_at,
      description: item.description,
    };
  });

  const currentProject = await Project.find({
    profile: req.user.profile,
  });

  const itemToInsertINtoDatabase = projects.filter((el) => {
    return !currentProject.filter((item) => {
      return item.repoID === el.repoID;
    }).length;
  });
  // !b.filter(y => y.id === i.id).length

  //create multiple documents
  const projectInsertedin = await Project.insertMany(itemToInsertINtoDatabase);
  console.log(projectInsertedin);

  projectInsertedin.map((project) => {
    user.project.push(project._id);
  });

  await user.save();
  //Add all Project into profile

  const allProject = await Project.find({
    profile: req.user.profile,
  });

  res.status("200").json({
    status: "success",
    length: allProject.length,
    data: {
      projects: allProject,
    },
  });
});

exports.getProjectDetails = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new AppError("Project Details Not Found", 404));
  }
  res.status(201).json({
    status: "success",
    data: {
      project: project,
    },
  });
});

exports.updateProjectDetails = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  console.log(project);
  if (!project) {
    return next(new AppError("Project not found By id", 404));
  }

  if (String(req.user.profile) !== String(project.profile)) {
    return next(
      new AppError("You are not authorize to update this item!", 400)
    );
  }
  await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    status: "success",
    message: "Project Details Update Successully",
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (String(req.user.profile) !== String(project.profile)) {
    return next(
      new AppError("You are not authorize to delete this item!", 400)
    );
  }
  await Project.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    status: "success",
    message: "Project Delete Update Successully",
  });
});

exports.createProject = catchAsync(async (req, res, next) => {
  const user = await Profile.findById(req.user.profile);

  const project = await Project.create({
    profile: req.user.profile,
    name: req.body.name,
    images: req.body.images,
    DemoUrl: req.body.url,
    updated_at: req.body.updated_at,
    description: req.body.description,
    logo: req.body.logo,
  });
  user.project.push(project._id);
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "New Project Add Successully",
  });
});

exports.addGalleryImage = catchAsync(async (req, res, next) => {
  const user = await Profile.findById(req.user.profile);

  const gallery = await Gallery.create({
    profile: req.user.profile,
    tittle: req.body.tittle,
    image: req.body.image,
    date: req.body.date,
    description: req.body.description,
  });
  user.gallery.push(gallery._id);
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "New Project Add Successully",
  });
});

exports.getAllGalleryImage = catchAsync(async (req, res, next) => {
  const image = await Gallery.find({
    profile: req.user.profile,
  });

  res.status("200").json({
    status: "success",
    length: allProject.length,
    data: {
      image: image,
    },
  });
});

exports.deleteImage = catchAsync(async (req, res, next) => {
  const project = await Gallery.findById(req.params.id);
  if (String(req.user.profile) !== String(project.profile)) {
    return next(
      new AppError("You are not authorize to delete this item!", 400)
    );
  }
  await Gallery.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    status: "success",
    message: "Image Delete Update Successully",
  });
});

exports.getProjectDetails = catchAsync(async (req, res, next) => {
  const project = await Gallery.findById(req.params.id);
  if (!project) {
    return next(new AppError(" Details Not Found", 404));
  }
  res.status(201).json({
    status: "success",
    data: {
      image: project,
    },
  });
});
