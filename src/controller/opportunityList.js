const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const cathAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { OpportunityList } = require("../models/opportunityList");
const Volunteer = require("../models/volunteer");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const { uploadToCloudinary } = require("../utils/cloudinary");
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");
const { identifyUserType } = require("../utils/userUtills");
const { jsonrepair } = require("jsonrepair");
exports.createOpportunityList = catchAsync(async (req, res, next) => {
  const parseIfArrayOrObject = (value) => {
    if (value == null) return value; // Handle null or undefined

    // Handle empty array case explicitly
    if (typeof value === "string" && value === "[]") {
      return []; // Return empty array when the value is "[]"
    }

    // Handle array-like string (non-empty arrays)
    if (
      typeof value === "string" &&
      value.startsWith("[") &&
      value.endsWith("]")
    ) {
      // Match items inside brackets, split by commas
      const items = value.match(/[^,\[\]]+/g);
      if (items) {
        return items.map((item) => {
          let trimmed = item.trim().replace(/^['"]|['"]$/g, ""); // Remove quotes if any
          if (!isNaN(trimmed) && trimmed !== "") {
            return Number(trimmed); // Convert to number if it's a valid number
          }
          return trimmed;
        });
      }
    }

    // Handle object-like string
    if (
      typeof value === "string" &&
      value.startsWith("{") &&
      value.endsWith("}")
    ) {
      try {
        return JSON.parse(value); // Parse valid JSON objects
      } catch (e) {
        return value; // If parsing fails, return the original string
      }
    }

    // Return value as is if no conditions match
    return value;
  };

  const data = req.body;
  Object.keys(data).forEach((key) => {
    data[key] = parseIfArrayOrObject(data[key]);
  });

  console.log("data values are ", data);

  const {
    userId,
    date,
    opportunityTitle,
    opportunityType,
    backgroundCheck,
    minParticipants,
    maxParticipants,
    opportunityPartner,
    impact,
    assignedManagers,
    cancellationPolicy,
    recurring,
    howToPrepare,
    opportunityAccess,
    description,
    favorite,
    latitude,
    longitude,
    fullAddress,
    locationDetails,
    donationAmount,
    availableDates,
    participantTypes,
    services,
    participantHighlights,
    duration,
    restrictions,
    subSegment,
    topSegment,
    waiverType,
    showLocation,
    adminSuggestion,
  } = data;

  // console.log("request files are ", req.files);
  if (!req.files || req.files.length === 0) {
    return next(new appError("No files uploaded", 400));
  }

  // // // 1. Upload images to Cloudinary
  const imageFiles = req.files?.images || [];
  const imageUrls = await Promise.all(
    imageFiles.map(async (file) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      return await uploadToCloudinary(file.buffer, fileName); // Upload image to Cloudinary
    })
  );

  // // Process "waiver" field (single file)
  let waiverUrl = "";
  if (req.files?.waiver && req.files?.waiver?.length > 0) {
    const waiverFile = req.files.waiver[0];
    const waiverFileName = `${Date.now()}-${waiverFile.originalname}`;
    waiverUrl = await uploadToCloudinary(waiverFile.buffer, waiverFileName); // Upload waiver PDF
  }

  // 3. Fetch user by accountType
  let accountType = identifyUserType(userId);

  let user;
  if (accountType === "IndividualUser") {
    user = await IndividualUser.findByPk(userId);
  } else if (accountType === "GroupAccount") {
    user = await GroupAccount.findByPk(userId);
  }

  if (!user) {
    return next(new appError("Invalid userId ", 400));
  }

  // 4. Prepare data to save
  const opportunityData = {
    userId,
    date,
    images: imageUrls,
    waiver: waiverUrl,
    opportunityTitle,
    opportunityType,
    backgroundCheck,
    minParticipants,
    maxParticipants,
    opportunityPartner,
    impact,
    // assignedManagers,
    cancellationPolicy,
    recurring,
    howToPrepare,
    opportunityAccess,
    description,
    favorite,
    latitude,
    longitude,
    fullAddress,
    locationDetails,
    donationAmount,
    availableDates,
    participantTypes,
    services,
    participantHighlights,
    duration,
    restrictions,
    subSegment,
    topSegment,
    waiverType,
    showLocation,
    adminSuggestion,
  };

  // 5. Filter out undefined values
  // const filteredData = Object.fromEntries(
  //   Object.entries(opportunityData).filter(([_, value]) => value !== undefined)
  // );
  const filteredData = Object.fromEntries(
    Object.entries(opportunityData).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === "object" && Object.keys(value).length === 0) &&
        value !== ""
    )
  );
  // 6. Check completeness for listing_status
  const requiredFields = [
    "userId",
    "date",
    "opportunityTitle",
    "opportunityType",
    "backgroundCheck",
    "minParticipants",
    "maxParticipants",
    "impact",
    "cancellationPolicy",
    "recurring",
    "howToPrepare",
    "opportunityAccess",
    "description",
    "favorite",
    "latitude",
    "longitude",
    "fullAddress",
    "donationAmount",
    "participantTypes",
    "services",
    "participantHighlights",
    "duration",
    "subSegment",
    "topSegment",
    "waiverType",
  ];

  const isComplete = requiredFields.every((field) =>
    filteredData.hasOwnProperty(field)
  );
  const missingFields = requiredFields.filter(
    (field) => !filteredData.hasOwnProperty(field)
  );
  console.log("Missing Fields: ", missingFields);
  filteredData.listingStatus = isComplete ? "published" : "inprogress";
  console.log("filter data is ", filteredData);
  // 7. Save to database
  const newOpportunity = await OpportunityList.create(filteredData);

  res.status(201).json({
    message: "Opportunity created successfully",
    data: newOpportunity,
  });
});

exports.updateOpportunityList = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Ensure the ID is provided
  if (!id) {
    return res.status(400).json({
      status: "fail",
      message: "Opportunity ID is required for updating.",
    });
  }

  // Find the opportunity by ID
  const opportunity = await OpportunityList.findByPk(id);

  if (!opportunity) {
    return res.status(404).json({
      status: "fail",
      message: `Opportunity with ID ${id} not found.`,
    });
  }

  // Extract fields that need to be updated
  const updates = req.body;
  const { newChangedUrls } = req.body;
  // Process file uploads
  let imageUrls = opportunity.images || []; // Keep existing images if no new images are uploaded
  let waiverUrl = opportunity.waiver || ""; // Keep existing waiver if not updated

  if (req.files) {
    // Handle image uploads (append new images to existing ones)
    if (req.files.images && req.files.images.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.images.map(async (file) => {
          const fileName = `${Date.now()}-${file.originalname}`;
          return await uploadToCloudinary(file.buffer, fileName); // Upload image to Cloudinary
        })
      );
      // imageUrls = [...imageUrls, ...uploadedImages];
      imageUrls = [...newChangedUrls, ...uploadedImages];
    }

    // Handle waiver upload
    if (req.files.waiver && req.files.waiver.length > 0) {
      const waiverFile = req.files.waiver[0];
      const waiverFileName = `${Date.now()}-${waiverFile.originalname}`;
      waiverUrl = await uploadToCloudinary(waiverFile.buffer, waiverFileName); // Upload waiver
    }
  }

  // Add files to update payload
  if (imageUrls.length > 0) {
    updates.images = imageUrls; // Ensure image_path is always updated if there are new images
  }
  if (waiverUrl) {
    updates.waiver = waiverUrl;
  }

  // Filter out undefined or null values
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  );

  // Update opportunity with filtered fields
  const updatedOpportunity = await opportunity.update(filteredUpdates);

  // Respond with success
  res.status(200).json({
    status: "success",
    message: "Opportunity updated successfully.",
    data: updatedOpportunity,
  });
});

exports.deleteOpportunityList = cathAsync(async (req, res, next) => {
  // Extract the ID of the opportunity to delete
  const { id } = req.params;

  // Ensure the ID is provided
  if (!id) {
    return res.status(400).json({
      status: "fail",
      message: "Opportunity ID is required for deletion.",
    });
  }

  // Find the opportunity by ID
  const opportunity = await OpportunityList.findByPk(id);

  // If the opportunity is not found, return an error
  if (!opportunity) {
    return res.status(404).json({
      status: "fail",
      message: `Opportunity with ID ${id} not found.`,
    });
  }

  // Delete the opportunity
  await opportunity.destroy();

  // Respond with success
  res.status(200).json({
    status: "success",
    message: `Opportunity with ID ${id} has been deleted successfully.`,
  });
});

exports.getAllOpportunities = cathAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  // Parse the page and limit to integers
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(pageSize) ||
    pageNumber <= 0 ||
    pageSize <= 0
  ) {
    return next(new appError("Page and limit must be positive integers", 400));
  }

  // Calculate offset for pagination
  const offset = (pageNumber - 1) * pageSize;

  // Query the database with pagination
  const { count, rows } = await OpportunityList.findAndCountAll({
    offset, // Skip the first N records
    limit: pageSize, // Return only this many records
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
      {
        model: IndividualUser,
        as: "individualHost",
        attributes: [
          "mission",
          "hours",
          "fullName",
          "photo",
          "username",
          "email",
        ],
      },
      {
        model: GroupAccount,
        as: "groupHost",
        attributes: ["mission", "hours", "photo", "username", "email"],
      },
    ],
  });

  if (!rows || rows.length === 0) {
    return next(new appError("No opportunities found", 404));
  }

  // Calculate average rating for each opportunity
  const opportunitiesWithRatings = rows.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const host = opportunity.individualHost || opportunity.groupHost || null;
    return {
      ...opportunity.toJSON(), // Convert Sequelize instance to plain object
      average_rating: averageRating.toFixed(2),
      host,
    };
  });

  // Return paginated results
  res.status(200).json({
    status: "success",
    totalItems: count,
    currentPage: pageNumber,
    totalPages: Math.ceil(count / pageSize),
    opportunities: opportunitiesWithRatings,
  });
});

exports.updateFavoriteStatus = cathAsync(async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;
  // Find the opportunity by ID
  const opportunity = await OpportunityList.findByPk(id);

  if (!opportunity) {
    return next(new appError("Opportunity not found", 404));
  }

  // Update the favorite field
  opportunity.favorite = favorite;
  await opportunity.save();
  res.status(200).json({ message: "Favorite status updated successfully" });
});

exports.getFavoriteOpportunities = cathAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  // Parse the page and limit to integers
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(pageSize) ||
    pageNumber <= 0 ||
    pageSize <= 0
  ) {
    return next(new appError("Page and limit must be positive integers", 400));
  }

  const offset = (pageNumber - 1) * pageSize;

  const { count, rows } = await OpportunityList.findAndCountAll({
    where: { favorite: true },
    offset,
    limit: pageSize,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
      {
        model: IndividualUser,
        as: "individualHost",
        attributes: [
          "mission",
          "hours",
          "fullName",
          "photo",
          "username",
          "email",
        ],
      },
      {
        model: GroupAccount,
        as: "groupHost",
        attributes: ["mission", "hours", "photo", "username", "email"],
      },
    ],
  });

  if (!rows || rows.length === 0) {
    return next(new appError("No favorite opportunities found", 404));
  }
  const host = opportunity.individualHost || opportunity.groupHost || null;

  const opportunitiesWithRatings = rows.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    return {
      ...opportunity.toJSON(),
      average_rating: averageRating.toFixed(2),
      host,
    };
  });

  // Return paginated results
  res.status(200).json({
    status: "success",
    totalItems: count,
    currentPage: pageNumber,
    totalPages: Math.ceil(count / pageSize),
    favoriteOpportunities: opportunitiesWithRatings,
  });
});

exports.getOpportunitiesByDistance = cathAsync(async (req, res, next) => {
  const { latitude, longitude, distance, page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(pageSize) ||
    pageNumber <= 0 ||
    pageSize <= 0
  ) {
    return next(new appError("Page and limit must be positive integers", 400));
  }

  const offset = (pageNumber - 1) * pageSize;

  if (!latitude || !longitude || !distance) {
    return next(
      new appError("latitude, longitude, and distance are required", 400)
    );
  }

  const earthRadiusMiles = 3958.8; // Earth's radius in miles

  // Raw SQL query with Haversine formula
  const query = `
      SELECT * ,
        (${earthRadiusMiles} *
          acos(
            cos(radians(:latitude)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians(:longitude)) +
            sin(radians(:latitude)) *
            sin(radians(latitude))
          )
        ) AS distance
      FROM "OpportunityLists"
      WHERE (
        ${earthRadiusMiles} *
          acos(
            cos(radians(:latitude)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians(:longitude)) +
            sin(radians(:latitude)) *
            sin(radians(latitude))
          )
        ) <= :distance
      ORDER BY distance
      LIMIT :limit OFFSET :offset;
    `;

  const opportunities = await sequelize.query(query, {
    replacements: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      distance: parseFloat(distance),
      limit: parseInt(pageSize),
      offset: offset,
    },
    type: sequelize.QueryTypes.SELECT,
  });

  if (opportunities.length <= 0) {
    return next(new appError("No opportunities found", 404));
  }

  const opportunityIds = opportunities.map((opportunity) => opportunity.id);

  // Fetch opportunities with reviews and other related data
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: { id: opportunityIds },
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
      {
        model: IndividualUser,
        as: "individualHost",
        attributes: [
          "mission",
          "hours",
          "fullName",
          "photo",
          "username",
          "email",
        ],
      },
      {
        model: GroupAccount,
        as: "groupHost",
        attributes: ["mission", "hours", "photo", "username", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // Calculate average ratings
  const opportunitiesWithRatings = rows.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const host = opportunity.individualHost || opportunity.groupHost || null;
    return {
      ...opportunity.toJSON(),
      average_rating: averageRating.toFixed(2),
      host,
    };
  });

  // Pagination details
  const totalItems = count;
  const totalPages = Math.ceil(totalItems / pageSize);

  res.status(200).json({
    totalItems,
    currentPage: pageNumber,
    totalPages,
    opportunities: opportunitiesWithRatings,
  });
});

exports.getOpportunitiesBySegments = cathAsync(async (req, res, next) => {
  const { page = 1, limit = 10, subSegment, topSegment } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(pageSize) ||
    pageNumber <= 0 ||
    pageSize <= 0
  ) {
    return next(new appError("Page and limit must be positive integers", 400));
  }

  if (!topSegment || !subSegment) {
    return next(
      new appError("topSegment or subSegment values are required", 400)
    );
  }
  const filters = {};
  if (topSegment) filters.topSegment = topSegment;
  if (subSegment) filters.subSegment = subSegment;

  // Pagination offset
  const offset = (pageNumber - 1) * pageSize;

  // Query database with dynamic key filter and pagination
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: filters,
    offset,
    limit: pageSize,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
      {
        model: IndividualUser,
        as: "individualHost",
        attributes: [
          "mission",
          "hours",
          "fullName",
          "photo",
          "username",
          "email",
        ],
      },
      {
        model: GroupAccount,
        as: "groupHost",
        attributes: ["mission", "hours", "photo", "username", "email"],
      },
    ],
  });

  if (!rows || rows.length === 0) {
    return next(new appError("No opportunities found", 404));
  }

  // Calculate average ratings for opportunities
  const opportunitiesWithRatings = rows.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const host = opportunity.individualHost || opportunity.groupHost || null;
    return {
      ...opportunity.toJSON(),
      average_rating: averageRating.toFixed(2),
      host,
    };
  });

  // Return paginated results
  res.status(200).json({
    status: "success",
    totalItems: count,
    currentPage: pageNumber,
    totalPages: Math.ceil(count / pageSize),
    opportunities: opportunitiesWithRatings,
  });
});

exports.getOpportunitiesByTime = cathAsync(async (req, res, next) => {
  const { page = 1, limit = 10, hourRange } = req.query;

  // Parse inputs
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const rangeInHours = hourRange ? parseInt(hourRange, 10) : null;

  if (
    isNaN(pageNumber) ||
    isNaN(pageSize) ||
    pageNumber <= 0 ||
    pageSize <= 0
  ) {
    return next(
      new appError("Page and limit must be valid positive integers", 400)
    );
  }

  if (!rangeInHours || isNaN(rangeInHours) || rangeInHours <= 0) {
    return next(
      new appError(
        "Hour range must be provided as a valid positive integer",
        400
      )
    );
  }

  // Convert hour range to seconds
  const rangeInMilliseconds = rangeInHours * 3600 * 1000;

  // Calculate offset for pagination
  const offset = (pageNumber - 1) * pageSize;

  // Query the database
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.literal(`("duration"[2] - "duration"[1])`),
          rangeInMilliseconds
        ),
      ],
    },
    offset, // Skip the first N records
    limit: pageSize, // Return only this many records
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
      {
        model: IndividualUser,
        as: "individualHost",
        attributes: [
          "mission",
          "hours",
          "fullName",
          "photo",
          "username",
          "email",
        ],
      },
      {
        model: GroupAccount,
        as: "groupHost",
        attributes: ["mission", "hours", "photo", "username", "email"],
      },
    ],
  });

  if (!rows || rows.length === 0) {
    return next(new appError("No opportunities found", 404));
  }

  // Calculate average rating for each opportunity
  const opportunitiesWithRatings = rows.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const host = opportunity.individualHost || opportunity.groupHost || null;
    return {
      ...opportunity.toJSON(), // Convert Sequelize instance to plain object
      average_rating: averageRating.toFixed(2),
      host,
    };
  });

  res.status(200).json({
    status: "success",
    totalItems: count,
    currentPage: pageNumber,
    totalPages: Math.ceil(count / pageSize),
    opportunities: opportunitiesWithRatings,
  });
});

exports.getFilteredOpportunities = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    topSegment,
    subSegment,
    participantTypes,
    services,
    participantHighlights,
    donationAmount,
  } = req.query;

  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;

  if (pageNumber <= 0 || pageSize <= 0) {
    return next(
      new appError("Page and limit must be valid positive integers", 400)
    );
  }

  const filters = {};

  // Top and Sub Segments Filtering
  if (topSegment || subSegment) {
    filters[Op.and] = [];
    if (topSegment) {
      filters[Op.and].push({ topSegment });
    }
    if (subSegment) {
      filters[Op.and].push({ subSegment });
    }
  }

  // Participant Types Filter
  if (participantTypes) {
    const suitableForArray = Array.isArray(participantTypes)
      ? participantTypes
      : participantTypes.split(",");
    filters.participantTypes = {
      [Op.overlap]: suitableForArray,
    };
  }

  // Services Filter
  if (services) {
    const serviceArray = Array.isArray(services)
      ? services
      : services.split(",");
    filters.services = {
      [Op.overlap]: serviceArray,
    };
  }

  if (participantHighlights) {
    const highlightArray = Array.isArray(participantHighlights)
      ? participantHighlights
      : participantHighlights.split(",");
    filters.participantHighlights = {
      [Op.overlap]: highlightArray,
    };
  }

  // Donation Amount Filter
  if (donationAmount) {
    const donationValue = parseInt(donationAmount, 10);
    if (donationValue === 1) {
      filters.donationAmount = { [Op.gt]: 0 };
    } else if (donationValue === 0) {
      filters.donationAmount = 0;
    } else {
      return next(new appError("Donation must be 0 or 1", 400));
    }
  }

  const offset = (pageNumber - 1) * pageSize;

  // Query the database with filters and pagination
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: filters,
    offset,
    limit: pageSize,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
      {
        model: IndividualUser,
        as: "individualHost",
        attributes: [
          "mission",
          "hours",
          "fullName",
          "photo",
          "username",
          "email",
        ],
      },
      {
        model: GroupAccount,
        as: "groupHost",
        attributes: ["mission", "hours", "photo", "username", "email"],
      },
    ],
  });

  if (!rows.length) {
    return next(
      new appError("No opportunities found matching the criteria", 404)
    );
  }

  // Calculate average ratings for each opportunity
  const opportunities = rows.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length
      ? (totalRating / reviews.length).toFixed(2)
      : "0.00";
    const host = opportunity.individualHost || opportunity.groupHost || null;

    return {
      ...opportunity.toJSON(),
      average_rating: averageRating,
      host,
    };
  });

  res.status(200).json({
    status: "success",
    totalItems: count,
    currentPage: pageNumber,
    totalPages: Math.ceil(count / pageSize),
    opportunities,
  });
});

exports.getOpportunitiesByUserAndAccountType = cathAsync(
  async (req, res, next) => {
    const { userId } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Validate query parameters
    if (!userId) {
      return next(new appError("userId is required", 400));
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(pageSize) ||
      pageNumber <= 0 ||
      pageSize <= 0
    ) {
      return next(
        new appError("Page and limit must be positive integers", 400)
      );
    }

    // Calculate offset for pagination
    const offset = (pageNumber - 1) * pageSize;

    // Query the database with filtering and pagination
    const { count, rows } = await OpportunityList.findAndCountAll({
      where: { userId },
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
      distinct: true,
      include: [
        { model: Volunteer, as: "volunteers" },
        { model: Review, as: "all_reviews" },
        {
          model: identifyUserType(userId) ? IndividualUser : GroupAccount,
          as: "host",
          attributes: [
            "mission",
            "hours",
            "fullName",
            "photo",
            "username",
            "email",
          ],
        },
      ],
    });

    if (!rows || rows.length === 0) {
      return next(
        new appError("No opportunities found for the given filters", 404)
      );
    }

    // Calculate average rating for each opportunity
    const opportunitiesWithRatings = rows.map((opportunity) => {
      const reviews = opportunity.all_reviews || [];
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating_count,
        0
      );
      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;
      return {
        ...opportunity.toJSON(), // Convert Sequelize instance to plain object
        average_rating: averageRating.toFixed(2),
      };
    });

    // Return filtered and paginated results
    res.status(200).json({
      status: "success",
      totalItems: count,
      currentPage: pageNumber,
      totalPages: Math.ceil(count / pageSize),
      opportunities: opportunitiesWithRatings,
    });
  }
);
