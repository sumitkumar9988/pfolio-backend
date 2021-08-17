const User = require("./../models/userModel");
const Education = require("./../models/educationModel");
const Profile = require("./../models/profileModel");
const Experience = require("./../models/experienceModel");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const service_account = require('../utils/key.json');
const { google } = require('googleapis');
var dateFormat = require('dateformat');
const reporting = google.analyticsreporting('v4');
let scopes = ['https://www.googleapis.com/auth/analytics.readonly'];

let jwt = new google.auth.JWT(
  service_account.client_email,
  null,
  service_account.private_key,
  scopes
);

let view_id = '244321056';

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



exports.getAnalticsData = catchAsync(async (req, res, next) => {

  const profile=await Profile.findById(req.user.profile);
  const username=profile.username;
  const total_days = req.body.total_days || 90;
  const today_date = dateFormat(new Date(), 'yyyy-mm-dd');
  const milli_second_in_days = 86400000;
  let last_date;

  if (total_days === 7) {
    last_date = new Date(new Date() - 7 * milli_second_in_days);
  } else if (total_days === 30) {
    last_date = new Date(new Date() - 30 * milli_second_in_days);
  } else {
    last_date = new Date(new Date() - 90 * milli_second_in_days);
  }

  let allDate = gernateDate(last_date, new Date());
  last_date = dateFormat(last_date, 'yyyy-mm-dd');

  let metrics_report = {
    reportRequests: [
      {
        viewId: view_id,
        dateRanges: [{ startDate: last_date, endDate: today_date }],
        metrics: [{ expression: 'ga:pageviews' }],
        dimensions: [{ name: 'ga:date' }, { name: 'ga:pagePath' }],
        dimensionFilterClauses: [
          {
            filters: [
              {
                operator: 'EXACT',
                dimensionName: 'ga:pagePath',
                expressions: [`${username}.pfolio.me/`],
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    await jwt.authorize();
    let request = {
      headers: { 'Content-Type': 'application/json' },
      auth: jwt,
      resource: metrics_report,
    };

    const { data } = await reporting.reports.batchGet(request);
    const rowData = data.reports[0].data.rows;
    if(!rowData){
      return next(new AppError("No Data found", 404)); 
    }
    const totalData = data.reports[0].data.totals;
    const filterData = filterAnalticsData(rowData);

    // filter between allDate and filterData

    Object.keys(allDate).forEach(function (key) {
      if (filterData[key]) {
        allDate[key] = filterData[key];
      }
    });

    //  const datewithFormat= changeDateFormat('20210708');
    res.status(201).json({
      status: 'sucess',
      data: allDate,
      totalUser: totalData[0].values[0],
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

const filterAnalticsData = (data) => {
  let filterdata = {};
  for (var index = 0; index < data.length; index++) {
    let date = data[index].dimensions[0];
    date = changeDateFormat(date);
    const value = data[index].metrics[0].values[0];
    filterdata[date] = value;
  }
  return filterdata;
};
// funky date format from google analtics 20210708 YYYYMMDD cahnge to DD-MM-YYYY
const changeDateFormat = (funkyDateFormat) => {
  const year = funkyDateFormat.slice(0, 4);
  const month = funkyDateFormat.slice(4, 6);
  const day = funkyDateFormat.slice(6, 8);
  const format = year + '-' + month + '-' + day;
  return format;
};

const gernateDate = (startDate, endDate) => {
  const milli_second_in_days = 86400000;
  let start = new Date(startDate);
  let end = new Date(endDate);
  let dt;

  let data = {};
  while (start <= end) {
    start = new Date(start.getTime() + milli_second_in_days);
    dt = dateFormat(start, 'yyyy-mm-dd');
    data[dt] = 0;
  }
  return data;
};
