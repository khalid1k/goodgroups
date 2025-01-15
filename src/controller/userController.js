const IndividualUser = require("../models/individual-account");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { Sequelize, Op } = require("sequelize");
exports.changeUserLevel = catchAsync(async (req, res, next) => {
  const { id, levelValue } = req.query;
  if (!id) {
    return next(new appError("user id is required", id));
  }
  if (!levelValue) {
    return next(new appError("level value is required"));
  }
  const user = await IndividualUser.findByPk(id);
  if (!user) {
    return next(new appError("user not found", 404));
  }
  user.levels = levelValue;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "level is changed",
  });
});

exports.changeUserPoints = catchAsync(async (req, res, next) => {
  const { id, pointsValue } = req.query;
  if (!id) {
    return next(new appError("user id is required", id));
  }
  if (!pointsValue || isNaN(Number(pointsValue))) {
    return next(new appError("Valid points value is required", 400));
  }
  const user = await IndividualUser.findByPk(id);
  if (!user) {
    return next(new appError("user not found", 404));
  }
  user.points = (Number(user.points) || 0) + Number(pointsValue);
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Points value has been added",
  });
});

exports.getUsersAroundSpecifiedUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new appError("User ID is required", 400));
  }

  // Find the user by ID
  const targetUser = await IndividualUser.findByPk(id, {
    attributes: ["photo", "fullName", "hours"], // Limit fields
  });
  if (!targetUser) {
    return next(new appError("User not found", 404));
  }

  const targetHours = targetUser.hours;

  // Fetch users with higher `hours`
  const topUsers = await IndividualUser.findAll({
    where: {
      hours: { [Sequelize.Op.gt]: targetHours }, // Hours greater than the target user
    },
    order: [["hours", "DESC"]], // Descending order
    limit: 5, // Fetch 5 users
  });

  // Fetch users with lower `hours`
  const bottomUsers = await IndividualUser.findAll({
    where: {
      hours: { [Sequelize.Op.lt]: targetHours }, // Hours less than the target user
    },
    order: [["hours", "DESC"]], // Descending order
    limit: 4, // Fetch 4 users
  });

  // Combine results: Top users + Target user + Bottom users
  const result = [...topUsers, targetUser, ...bottomUsers];

  res.status(200).json({
    status: "success",
    data: {
      users: result,
    },
  });
});

exports.getUserHoursAndDob = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new appError("id is required", 400));
  }
  const user = await IndividualUser.findByPk(id, {
    attributes: ["birthday", "hours"], // Limit fields
  });
  if (!user) {
    return next(new appError("User not Found", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.changeUserBadge = catchAsync(async (req, res, next) => {
  const { id, badgeValue } = req.query;
  if (!id) {
    return next(new appError("user id is required", id));
  }
  if (!badgeValue) {
    return next(new appError("Badge value is required", 400));
  }
  const user = await IndividualUser.findByPk(id);
  if (!user) {
    return next(new appError("user not found", 404));
  }
  user.presidentialRewards = badgeValue;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Badge is changed",
  });
});
