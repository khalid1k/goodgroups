const GroupAccount = require("../models/group-account");
const IndividualUser = require("../models/individual-account");

// Function to identify the user type based on the ID prefix
function identifyUserType(userId) {
  if (userId.startsWith("individual-")) {
    return "IndividualUser";
  } else if (userId.startsWith("group-")) {
    return "GroupAccount";
  } else {
    return "Unknown";
  }
}

const getUserById = async (userId) => {
  const accountType = identifyUserType(userId);
  if (accountType === "IndividualUser") {
    return await IndividualUser.findByPk(userId);
  } else if (accountType === "GroupAccount") {
    return await GroupAccount.findByPk(userId);
  }

  return null;
};

module.exports = {
  identifyUserType,
  getUserById,
};
