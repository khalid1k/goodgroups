const MyGroup = require("../models/myGroup");
const GroupAccount = require("../models/group-account");
const IndividualUser = require("../models/individual-account");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { Op } = require("sequelize");

exports.addUserToGroup = catchAsync(async (req, res, next) => {
  const { userId, groupId, role } = req.body;

  // Check if user and group exist
  const user = await IndividualUser.findByPk(userId);
  const group = await GroupAccount.findByPk(groupId);

  if (!user || !group) {
    return next(new appError("user not found", 404));
  }
  if (!group) {
    return next(new appError("Group not found", 404));
  }

  // Check if user is already in the group
  const existingEntry = await MyGroup.findOne({
    where: { userId, groupId },
  });

  if (existingEntry) {
    return next(new appError("User already in the group", 400));
  }

  // Add user to the group
  const newEntry = await MyGroup.create({
    userId,
    groupId,
    role: role || "member",
  });

  res.status(201).json({
    message: "User added to group successfully",
    data: newEntry,
  });
});

exports.getUserGroups = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const groups = await MyGroup.findAll({
    where: { userId },
    include: [
      {
        model: GroupAccount,
        attributes: ["groupName"],
      },
    ],
  });

  if (!groups.length) {
    return next(new appError("No groups found for this user", 404));
  }

  res.status(200).json({ status: "success", data: groups });
});
