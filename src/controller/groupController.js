const MyGroup = require("../models/myGroup");
const GroupAccount = require("../models/group-account");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
exports.addUserToGroup = catchAsync(async (req, res, next) => {
  const { userId, groupId, role = "member" } = req.query;
  const group = await GroupAccount.findByPk(groupId);

  if (!group) {
    return next(new appError("Group not found", 404));
  }

  const myGroup = await MyGroup.create({
    userId,
    groupId,
    role,
  });

  return myGroup;
});
