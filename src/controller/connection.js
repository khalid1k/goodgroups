const Connection = require("../models/connection");
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");
const { identifyUserType, getUserById } = require("../utils/userUtills");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { Op } = require("sequelize");
// Send a connection request
exports.sendRequest = catchAsync(async (req, res, next) => {
  const { senderId, receiverId } = req.query;

  const sender = await getUserById(senderId);
  const receiver = await getUserById(receiverId);

  if (!sender) {
    return next(new appError("Sender not found", 404));
  }
  if (!receiver) {
    return next(new appError("Receiver not found", 404));
  }

  // Check if connection already exists
  const existingConnection = await Connection.findOne({
    where: {
      senderId,
      receiverId,
      status: "pending",
    },
  });

  if (existingConnection) {
    return next(new appError("Connection request already sent", 400));
  }

  const connection = await Connection.create({
    senderId,
    receiverId,
    status: "pending",
  });

  res.status(201).json({ message: "Connection request sent", connection });
});

// Get Pending Connection Requests for the Receiver
exports.getPendingRequests = catchAsync(async (req, res, next) => {
  const { receiverId } = req.query;

  const pendingConnections = await Connection.findAll({
    where: { receiverId, status: "pending" },
  });

  if (pendingConnections.length === 0) {
    return next(new appError("No pending requests", 404));
  }

  res.status(200).json({ message: "success", pendingConnections });
});

// Approve or Reject Connection Request
exports.updateRequestStatus = catchAsync(async (req, res, next) => {
  const { connectionId, action } = req.body; // action: 'approve' or 'reject'

  const connection = await Connection.findByPk(connectionId);

  if (!connection) {
    return next(new appError("Connection not found", 404));
  }

  if (connection.status !== "pending") {
    return next(new appError("Request already processed", 400));
  }

  // Update status based on action
  if (action === "approve") {
    await connection.update({ status: "approved" });
    res.status(200).json({ message: "Connection request approved" });
  } else if (action === "reject") {
    await connection.destroy();
    res
      .status(200)
      .json({ message: "Connection request rejected and deleted" });
  } else {
    res.status(400).json({ error: "Invalid action" });
  }
});

exports.getApprovedConnections = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const { rows, count } = await Connection.findAndCountAll({
    where: {
      [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      status: "approved",
    },
    limit,
    offset: (page - 1) * limit,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: IndividualUser,
        as: "sender",
        attributes: ["fullName", "username", "photo"],
        required: false,
      },
      {
        model: GroupAccount,
        as: "senderGroup",
        attributes: ["username", "groupName", "photo"],
        required: false,
      },
      {
        model: IndividualUser,
        as: "receiver",
        attributes: ["fullName", "username", "photo"],
        required: false,
      },
      {
        model: GroupAccount,
        as: "receiverGroup",
        attributes: ["username", "groupName", "photo"],
        required: false,
      },
    ],
  });

  // If no approved connections found, return an error
  if (count === 0) {
    return next(
      new appError("No approved connections found for this user", 404)
    );
  }

  // Calculate total number of pages
  const totalPages = Math.ceil(count / limit);

  // Return the approved connections with user info and pagination details
  res.status(200).json({
    message: "Approved connections retrieved successfully",
    data: rows.map((connection) => ({
      sender: connection.sender
        ? {
            username: connection.sender.username,
            photo: connection.sender.photo,
            fullName: connection.sender.photo,
          }
        : connection.senderGroup
        ? {
            username: connection.senderGroup.groupName,
            photo: connection.senderGroup.photo,
          }
        : null, // Sender info, check if it's an individual or group
      receiver: connection.receiver
        ? {
            username: connection.receiver.username,
            photo: connection.receiver.photo,
          }
        : connection.receiverGroup
        ? {
            groupName: connection.receiverGroup.groupName,
            photo: connection.receiverGroup.photo,
          }
        : null, // Receiver info, check if it's an individual or group
    })),
    pagination: {
      currentPage: page,
      totalPages,
      totalConnections: count,
      perPage: limit,
    },
  });
});
