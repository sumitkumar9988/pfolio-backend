const User = require("./../models/userModel");
const Education = require("./../models/educationModel");
const Profile = require("./../models/profileModel");
const Skill = require("./../models/skillModels");
const Experience = require("./../models/experienceModel");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const service_account = require("../utils/key.json");
const { google } = require("googleapis");
const axios = require("axios");
const dateFormat = require("dateformat");
const client = require("@sendgrid/client");
client.setApiKey(
  "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"
);
const reporting = google.analyticsreporting("v4");
let scopes = ["https://www.googleapis.com/auth/analytics.readonly"];

let jwt = new google.auth.JWT(
  service_account.client_email,
  null,
  service_account.private_key,
  scopes
);

let view_id = "255381018";

exports.uploadImage = catchAsync(async (req, res, next) => {
  const image = req.body.image;
  return res.status(200).json({
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
  const profile = await Profile.findById(req.user.profile).select(
    "-skills -education -experience -project -__v"
  );
  if (!profile) {
    return next(
      new AppError(
        "You don`t have any profile! Please create your profile",
        404
      )
    );
  }
  return res.status(200).json({
    status: "success",
    data: profile,
  });
});

exports.createProfile = catchAsync(async (req, res, next) => {
  console.log(req.body.username);
  if (!req.body.username) {
    return next(new AppError("Enter your unique username!", 404));
  }
  const profile = await Profile.findById(req.user.profile);
  if (profile) {
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.user.profile,
      {
        username: req.body.username,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    const newProfile = await Profile.create({
      user: req.user.id,
      name: req.user.name,
      email: req.user.email,
      photo: req.user.photo,
      username: req.body.username,
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
  }
  return res.status(200).json({
    status: "success",
    message: "Profile Succussfully created !",
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
  delete req.body.domain;

  await Profile.findByIdAndUpdate(req.user.profile, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Profile details update successfully!",
  });
});

exports.addToWaitlist = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const link = req.body.link;

  const { data } = await axios.post(
    "https://getwaitlist.com/api/v1/waitlists/submit",
    {
      api_key: "MAWRAM",
      email: email,
      referral_link: link,
    }
  );

  const body = {
    list_ids: ["fad17a82-5849-4358-b120-cec1b698ac1f"],
    contacts: [
      {
        email: email,
      },
    ],
  };

  const request = {
    url: `/v3/marketing/contacts`,
    method: "PUT",
    body: body,
  };

  client
    .request(request)
    .then(([response, body]) => {
      return res.status(200).json({
        status: "success",
        message: "Successfully added to waitlist! We will updte You soon",
        data: data,
      });
    })
    .catch((error) => {
      console.error("error", error);
      return null;
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
  return res.status(201).json({
    status: "success",
    data: education,
  });
});

exports.getAllEducation = catchAsync(async (req, res, next) => {
  const education = await Education.find({
    profile: req.user.profile,
  });
  return res.status(201).json({
    status: "success",
    length: education.length,
    data: education,
  });
});

exports.getAllSkills = catchAsync(async (req, res, next) => {
  const skills = await Skill.find({
    profile: req.user.profile,
  });
  return res.status(201).json({
    status: "success",
    length: skills.length,
    data: skills,
  });
});

exports.getSkillsByID = catchAsync(async (req, res, next) => {
  const skills = await Skill.findById(req.params.id);
  return res.status(201).json({
    status: "success",
    data: skills,
  });
});

exports.addEducation = catchAsync(async (req, res, next) => {
  const image =
    req.body.image ||
    "https://firstletter-multimedia.s3.ap-south-1.amazonaws.com/university.png";
  const education = await Education.create({
    institute: req.body.institute,
    profile: req.user.profile,
    logo: image,
    degree: req.body.degree,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    course: req.body.course,
  });

  const profile = await Profile.findById(req.user.profile);
  profile.education.push(education._id);
  await profile.save();

  return res.status(200).json({
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
  return res.status(200).json({
    status: "success",
    message: "Education delete success",
  });
});

exports.updateEducation = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const education = await Education.findById(req.params.id);
  console.log(education);
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

  return res.status(201).json({
    status: "success",
    message: "Education updated",
  });
});

exports.allUserExeprience = catchAsync(async (req, res, next) => {
  const experience = await Experience.find({
    profile: req.user.profile,
  });
  return res.status(201).json({
    status: "success",
    length: experience.length,
    data: experience,
  });
});

exports.getExperienceById = catchAsync(async (req, res, next) => {
  console.log();
  const experience = await Experience.findById(req.params.id);
  if (!experience) {
    return next(new AppError("No such data availabe with this ID", 400));
  }
  return res.status(201).json({
    status: "success",
    data: experience,
  });
});

exports.addExperience = catchAsync(async (req, res, next) => {
  const image =
    req.body.image ||
    "https://firstletter-multimedia.s3.ap-south-1.amazonaws.com/company.png";
  const experience = await Experience.create({
    jobTitle: req.body.jobTitle,
    profile: req.user.profile,
    organization: req.body.organization,
    logo: image,
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

  return res.status(200).json({
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
  return res.status(201).json({
    status: "success",
    message: "Experience details update successfully",
  });
});

exports.addSkills = catchAsync(async (req, res, next) => {
  const skill = await Skill.create({
    skill: req.body.skill,
    profile: req.user.profile,
    logo: req.body.logo,
  });

  const profile = await Profile.findById(req.user.profile);
  profile.skills.push(skill._id);
  await profile.save();

  return res.status(200).json({
    status: "success",
    message: "new skill add successfully !",
  });
});

exports.removeSkills = catchAsync(async (req, res, next) => {
  const userSkill = await Skill.findById(req.params.id);
  if (!userSkill) {
    return next(new AppError("No document found with that ID", 404));
  }

  if (String(req.user.profile) !== String(userSkill.profile)) {
    return next(
      new AppError("You are not authorize to delete this item!", 400)
    );
  }
  await Skill.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    status: "success",
    message: "Item delete successfully",
  });
});

exports.checkDomain = catchAsync(async (req, res, next) => {
  const data = await Profile.findOne({ domain: req.body.domain });
  if (!data) {
    return next(new AppError("Domain not exist", 404));
  } else {
    res.status(200).json({
      status: "success",
      message: "Domain exist!",
    });
  }
});

exports.domain = catchAsync(async (req, res, next) => {
  console.log(req.headers.domain);
  if (!req.headers.domain) {
    return next(new AppError("Domain not exist!", 404));
  }
  const data = await Profile.findOne({ domain: req.headers.domain })
    .populate("education")
    .populate("experience")
    .populate("gallery")
    .populate("skills")
    .populate("project", null, {
      included: true,
    });
  if (!data) {
    return next(new AppError("Domain not exist!", 404));
  } else {
    res.status(200).json({
      status: "success",
      data: data,
    });
  }
});

exports.updateDomain = catchAsync(async (req, res, next) => {
  const user = await Profile.findOne({ domain: req.body.domain });
  if (!user) {
    await Profile.findByIdAndUpdate(
      req.user.profile,
      { domain: req.body.domain },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(201).json({
      status: "success",
      message: "Domain Update Successfully!",
    });
  } else {
    return next(
      new AppError("Domain Already exist ! Please enter different One")
    );
  }
});

exports.getAnalticsData = catchAsync(async (req, res, next) => {
  const profile = await Profile.findById(req.user.profile);
  if (!profile.domain) {
    return next(
      new AppError("You Don't add any domain yet ! Please setup your domain")
    );
  }
  const website = profile.domain;
  const total_days = 30;
  const today_date = dateFormat(new Date(), "yyyy-mm-dd");
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
  last_date = dateFormat(last_date, "yyyy-mm-dd");
  console.log(website);

  let metrics_report = {
    reportRequests: [
      {
        viewId: view_id,
        dateRanges: [{ startDate: last_date, endDate: today_date }],
        metrics: [{ expression: "ga:pageviews" }],
        dimensions: [{ name: "ga:date" }, { name: "ga:pagePath" }],
        dimensionFilterClauses: [
          {
            filters: [
              {
                operator: "EXACT",
                dimensionName: "ga:pagePath",
                expressions: [`${website}/`],
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
      headers: { "Content-Type": "application/json" },
      auth: jwt,
      resource: metrics_report,
    };

    const { data } = await reporting.reports.batchGet(request);
    const rowData = data.reports[0].data.rows;
    if (!rowData) {
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
      status: "sucess",
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
  const format = year + "-" + month + "-" + day;
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
    dt = dateFormat(start, "yyyy-mm-dd");
    data[dt] = 0;
  }
  return data;
};
