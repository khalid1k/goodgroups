const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const cathAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { OpportunityList } = require("../models/opportunityList");
const Volunteer = require("../models/volunteer");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");

exports.createOpportunityList = async (req, res, next) => {
  try {
    // Extract data from the request body
    const {
      date_time,
      image_path,
      title,
      category,
      background_check,
      minimum_participants,
      maximum_participants,
      partner_cohost_group,
      impact_reporting,
      waiver,
      assigned_managers,
      cancellation_policy,
      opportunity_recurring,
      listing_status,
      prepare_plane_description,
      opportunity_access,
      description,
      hours,
      favorite,
      about,
      latitude,
      longitude,
      full_address,
      location_detail,
      preparation,
      donationAmount,
      available_dates,
      restrictions,
      suitable_for,
      services,
      highlights,
      duration,
      segments,
    } = req.body;

    // Validate required fields
    if (
      !date_time ||
      !image_path ||
      !title ||
      !category ||
      !description ||
      !latitude ||
      !longitude ||
      !full_address ||
      !hours ||
      !available_dates ||
      !restrictions ||
      !suitable_for
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Missing required fields. Please provide all mandatory values.",
      });
    }

    // Create the new opportunity
    const newOpportunity = await OpportunityList.create({
      date_time,
      image_path,
      title,
      category,
      background_check,
      minimum_participants,
      maximum_participants,
      partner_cohost_group,
      impact_reporting,
      waiver,
      assigned_managers,
      cancellation_policy,
      opportunity_recurring,
      listing_status,
      prepare_plane_description,
      opportunity_access,
      description,
      hours,
      favorite,
      about,
      latitude,
      longitude,
      full_address,
      location_detail,
      preparation,
      donationAmount,
      available_dates,
      restrictions,
      suitable_for,
      services,
      highlights,
      duration,
      segments,
    });

    // Respond with success
    res.status(201).json({
      status: "success",
      message: "Opportunity created successfully",
      data: newOpportunity,
    });
  } catch (error) {
    console.error("Error creating opportunity:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        status: "fail",
        message: "Validation error",
        errors: error.errors.map((err) => err.message),
      });
    }

    next(error); // Pass unexpected errors to the global error handler
  }
};

exports.updateOpportunityList = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Ensure the ID is provided
  if (!id) {
    return res.status(400).json({
      status: "fail",
      message: "Opportunity ID is required for updating.",
    });
  }

  // Extract the data to be updated
  const {
    date_time,
    image_path,
    title,
    category,
    background_check,
    minimum_participants,
    maximum_participants,
    partner_cohost_group,
    impact_reporting,
    waiver,
    assigned_managers,
    cancellation_policy,
    opportunity_recurring,
    listing_status,
    prepare_plane_description,
    opportunity_access,
    description,
    hours,
    favorite,
    about,
    latitude,
    longitude,
    full_address,
    location_detail,
    preparation,
    donationAmount,
    available_dates,
    restrictions,
    suitable_for,
    services,
    highlights,
    duration,
    segments,
  } = req.body;

  // Find the opportunity by ID
  const opportunity = await OpportunityList.findByPk(id);

  // If the opportunity is not found, return an error
  if (!opportunity) {
    return res.status(404).json({
      status: "fail",
      message: `Opportunity with ID ${id} not found.`,
    });
  }

  // Update the opportunity with new values
  const updatedOpportunity = await opportunity.update({
    date_time,
    image_path,
    title,
    category,
    background_check,
    minimum_participants,
    maximum_participants,
    partner_cohost_group,
    impact_reporting,
    waiver,
    assigned_managers,
    cancellation_policy,
    opportunity_recurring,
    listing_status,
    prepare_plane_description,
    opportunity_access,
    description,
    hours,
    favorite,
    about,
    latitude,
    longitude,
    full_address,
    location_detail,
    preparation,
    donationAmount,
    available_dates,
    restrictions,
    suitable_for,
    services,
    highlights,
    duration,
    segments,
  });

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
    return {
      ...opportunity.toJSON(), // Convert Sequelize instance to plain object
      average_rating: averageRating.toFixed(2),
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

// Get a single opportunity by ID
const getOpportunityById = async (req, res) => {
  const { id } = req.params;
  try {
    const opportunity = await OpportunityList.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.status(200).json(opportunity);
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    res.status(500).json({ message: "Failed to retrieve opportunity", error });
  }
};

// Create a new opportunity
const createOpportunity = async (req, res) => {
  try {
    const newOpportunity = await OpportunityList.create(req.body);
    res.status(201).json(newOpportunity);
  } catch (error) {
    console.error("Error creating opportunity:", error);
    res.status(400).json({ message: "Failed to create opportunity", error });
  }
};

// Update an opportunity by ID
const updateOpportunity = async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await OpportunityList.update(req.body, { where: { id } });
    if (!updated) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    const updatedOpportunity = await OpportunityList.findByPk(id);
    res.status(200).json(updatedOpportunity);
  } catch (error) {
    console.error("Error updating opportunity:", error);
    res.status(400).json({ message: "Failed to update opportunity", error });
  }
};

// Delete an opportunity by ID
const deleteOpportunity = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await OpportunityList.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    res.status(500).json({ message: "Failed to delete opportunity", error });
  }
};

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
    ],
  });

  if (!rows || rows.length === 0) {
    return next(new appError("No favorite opportunities found", 404));
  }

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

// exports.getOpportunitiesByDistance = cathAsync(async (req, res, next) => {
//   const { latitude, longitude, distance, page = 1, limit = 10 } = req.query;
//   const pageNumber = parseInt(page, 10);
//   const pageSize = parseInt(limit, 10);

//   if (
//     isNaN(pageNumber) ||
//     isNaN(pageSize) ||
//     pageNumber <= 0 ||
//     pageSize <= 0
//   ) {
//     return next(new appError("Page and limit must be positive integers", 400));
//   }

//   const offset = (pageNumber - 1) * pageSize;

//   if (!latitude || !longitude || !distance) {
//     return next(
//       new appError("latitude, longitude, and distance are required", 400)
//     );
//   }

//   const earthRadiusKm = 6371; // Earth's radius in kilometers

//   // Raw SQL query with Haversine formula
//   const query = `
//       SELECT *,
//         (${earthRadiusKm} *
//           acos(
//             cos(radians(:latitude)) *
//             cos(radians(latitude)) *
//             cos(radians(longitude) - radians(:longitude)) +
//             sin(radians(:latitude)) *
//             sin(radians(latitude))
//           )
//         ) AS distance
//       FROM "OpportunityLists"
//       WHERE (
//         ${earthRadiusKm} *
//           acos(
//             cos(radians(:latitude)) *
//             cos(radians(latitude)) *
//             cos(radians(longitude) - radians(:longitude)) +
//             sin(radians(:latitude)) *
//             sin(radians(latitude))
//           )
//         ) <= :distance
//       ORDER BY distance
//       LIMIT :limit OFFSET :offset;
//     `;

//   const opportunities = await sequelize.query(query, {
//     replacements: {
//       latitude: parseFloat(latitude),
//       longitude: parseFloat(longitude),
//       distance: parseFloat(distance),
//       limit: parseInt(pageSize),
//       offset: offset,
//     },
//     type: sequelize.QueryTypes.SELECT,
//   });

//   if (opportunities.length <= 0) {
//     return next(new appError("No opportunities found", 404));
//   }

//   const opportunityIds = opportunities.map((opportunity) => opportunity.id);

//   // Fetch opportunities with reviews and other related data
//   const { count, rows } = await OpportunityList.findAndCountAll({
//     where: { id: opportunityIds },
//     distinct: true,
//     include: [
//       { model: Volunteer, as: "volunteers" },
//       { model: Review, as: "all_reviews" },
//     ],
//   });

//   // Calculate average ratings
//   const opportunitiesWithRatings = rows.map((opportunity) => {
//     const reviews = opportunity.all_reviews || [];
//     const totalRating = reviews.reduce(
//       (sum, review) => sum + review.rating_count,
//       0
//     );
//     const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

//     return {
//       ...opportunity.toJSON(),
//       average_rating: averageRating.toFixed(2),
//     };
//   });

//   // Pagination details
//   const totalItems = count;
//   const totalPages = Math.ceil(totalItems / pageSize);

//   res.status(200).json({
//     totalItems,
//     currentPage: pageNumber,
//     totalPages,
//     opportunities: opportunitiesWithRatings,
//   });
// });

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

    return {
      ...opportunity.toJSON(),
      average_rating: averageRating.toFixed(2),
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
  const { page = 1, limit = 10, segmentKey } = req.query;
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

  if (!segmentKey || typeof segmentKey !== "string") {
    return next(
      new appError("Segment key is required and must be a valid string", 400)
    );
  }

  // Pagination offset
  const offset = (pageNumber - 1) * pageSize;

  // Query database with dynamic key filter and pagination
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: {
      // Check if the segmentKey exists as a key in the segments JSON object
      segments: {
        [Op.contains]: {
          [segmentKey]: [], // Matches any value for the key
        },
      },
    },
    offset,
    limit: pageSize,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
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
    return {
      ...opportunity.toJSON(),
      average_rating: averageRating.toFixed(2),
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

// exports.getOpportunitiesByTime = cathAsync(async (req, res, next) => {
//   const { page = 1, limit = 10, timeInMilliseconds } = req.query;

//   // Parse the page, limit, and timeInMilliseconds
//   const pageNumber = parseInt(page, 10);
//   const pageSize = parseInt(limit, 10);
//   const timeThreshold = timeInMilliseconds
//     ? parseInt(timeInMilliseconds, 10)
//     : null;

//   if (
//     isNaN(pageNumber) ||
//     isNaN(pageSize) ||
//     pageNumber <= 0 ||
//     pageSize <= 0
//   ) {
//     return next(new appError("Page and limit must be positive integers", 400));
//   }

//   if (!timeThreshold || isNaN(timeThreshold)) {
//     return next(
//       new appError("Time must be provided in valid milliseconds", 400)
//     );
//   }

//   // Calculate offset for pagination
//   const offset = (pageNumber - 1) * pageSize;

//   // Build the query condition for filtering by time
//   const timeCondition = {
//     date_time: {
//       [Op.between]: [
//         Math.floor(timeThreshold / 1000) - 3600, // 1 hour before in seconds
//         Math.floor(timeThreshold / 1000) + 3600, // 1 hour after in seconds
//       ],
//     },
//   };

//   // Query the database with pagination and time filter
//   const { count, rows } = await OpportunityList.findAndCountAll({
//     where: {
//       ...timeCondition,
//     },
//     offset, // Skip the first N records
//     limit: pageSize, // Return only this many records
//     distinct: true,
//     include: [
//       { model: Volunteer, as: "volunteers" },
//       { model: Highlight, as: "highlights" },
//       { model: Service, as: "services" },
//       { model: Review, as: "all_reviews" },
//     ],
//   });

//   if (!rows || rows.length === 0) {
//     return next(new appError("No opportunities found", 404));
//   }

//   // Calculate average rating for each opportunity
//   const opportunitiesWithRatings = rows.map((opportunity) => {
//     const reviews = opportunity.all_reviews || [];
//     const totalRating = reviews.reduce(
//       (sum, review) => sum + review.rating_count,
//       0
//     );
//     const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
//     return {
//       ...opportunity.toJSON(), // Convert Sequelize instance to plain object
//       average_rating: averageRating.toFixed(2),
//     };
//   });

//   // Return paginated results
//   res.status(200).json({
//     status: "success",
//     totalItems: count,
//     currentPage: pageNumber,
//     totalPages: Math.ceil(count / pageSize),
//     opportunities: opportunitiesWithRatings,
//   });
// });

// exports.getOpportunitiesByTime = cathAsync(async (req, res, next) => {
//   const { page = 1, limit = 10, hourRange } = req.query;

//   // Parse inputs
//   const pageNumber = parseInt(page, 10);
//   const pageSize = parseInt(limit, 10);
//   const rangeInHours = hourRange ? parseInt(hourRange, 10) : null;

//   if (
//     isNaN(pageNumber) ||
//     isNaN(pageSize) ||
//     pageNumber <= 0 ||
//     pageSize <= 0
//   ) {
//     return next(
//       new appError("Page and limit must be valid positive integers", 400)
//     );
//   }

//   if (!rangeInHours || isNaN(rangeInHours) || rangeInHours <= 0) {
//     return next(
//       new appError(
//         "Hour range must be provided as a valid positive integer",
//         400
//       )
//     );
//   }

//   // Get current time in seconds and calculate the lower bound
//   const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
//   const lowerBound = currentTime - rangeInHours * 3600; // Subtract range in seconds

//   // Build the time filter condition
//   const timeCondition = {
//     date_time: {
//       [Op.between]: [lowerBound, currentTime],
//     },
//   };

//   // Calculate offset for pagination
//   const offset = (pageNumber - 1) * pageSize;

//   // Query the database
//   const { count, rows } = await OpportunityList.findAndCountAll({
//     where: timeCondition,
//     offset, // Skip the first N records
//     limit: pageSize, // Return only this many records
//     order: [["createdAt", "DESC"]],
//     distinct: true,
//     include: [
//       { model: Volunteer, as: "volunteers" },
//       { model: Review, as: "all_reviews" },
//     ],
//   });

//   if (!rows || rows.length === 0) {
//     return next(new appError("No opportunities found", 404));
//   }

//   // Calculate average rating for each opportunity
//   const opportunitiesWithRatings = rows.map((opportunity) => {
//     const reviews = opportunity.all_reviews || [];
//     const totalRating = reviews.reduce(
//       (sum, review) => sum + review.rating_count,
//       0
//     );
//     const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
//     return {
//       ...opportunity.toJSON(), // Convert Sequelize instance to plain object
//       average_rating: averageRating.toFixed(2),
//     };
//   });

//   res.status(200).json({
//     status: "success",
//     totalItems: count,
//     currentPage: pageNumber,
//     totalPages: Math.ceil(count / pageSize),
//     opportunities: opportunitiesWithRatings,
//   });
// });

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
    return {
      ...opportunity.toJSON(), // Convert Sequelize instance to plain object
      average_rating: averageRating.toFixed(2),
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

exports.getFilteredOpportunities = cathAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    segments,
    suitable_for,
    services,
    highlights,
    donation,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

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

  const filters = {};

  if (segments) {
    const segmentValues = segments.split(",").map((value) => value.trim());

    filters[Op.or] = segmentValues.map((value) => ({
      segments: {
        [Op.contains]: sequelize.cast(
          JSON.stringify({ [Op.any]: value }),
          "jsonb"
        ),
      },
    }));
  }

  // Suitable for filter
  if (suitable_for) {
    const suitableForArray = suitable_for.split(",");
    filters.suitable_for = { [Op.contains]: suitableForArray };
  }

  // Services filter
  if (services) {
    const serviceArray = services.split(",");
    filters.services = {
      [Op.or]: serviceArray.map((service) => ({
        [Op.contains]: [{ text: service }],
      })),
    };
  }

  // Highlights filter
  if (highlights) {
    const highlightArray = highlights.split(",");
    filters.highlights = {
      [Op.or]: highlightArray.map((highlight) => ({
        [Op.contains]: [{ text: highlight }],
      })),
    };
  }

  // Updated donation filter logic
  if (donation) {
    const donationValue = parseInt(donation, 10);
    if (donationValue === 1) {
      // Include records with any donation amount except 0
      filters.donationAmount = { [Op.gt]: 0 };
    } else if (donationValue === 0) {
      // Include records with donation amount equal to 0
      filters.donationAmount = 0;
    } else {
      return next(new appError("Donation must be 0 or 1", 400));
    }
  }

  const offset = (pageNumber - 1) * pageSize;

  // Query database with filters
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: filters,
    offset,
    limit: pageSize,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [
      { model: Volunteer, as: "volunteers" },
      { model: Review, as: "all_reviews" },
    ],
  });

  if (!rows || rows.length === 0) {
    return next(
      new appError("No opportunities found matching the criteria", 404)
    );
  }

  // Calculate average ratings
  const opportunities = rows.map((opportunity) => {
    const reviews = opportunity.all_reviews || [];
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating_count,
      0
    );
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      ...opportunity.toJSON(),
      average_rating: averageRating.toFixed(2),
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
