const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const cathAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { OpportunityList } = require("../models/opportunityList");
const Volunteer = require("../models/volunteer");
const Review = require("../models/review");

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

// exports.getOpportunitiesByDistance = async (req, res) => {
//   try {
//     const { latitude, longitude, distance } = req.query;

//     if (!latitude || !longitude || !distance) {
//       return res.status(400).json({
//         message: "latitude, longitude, and distance are required",
//       });
//     }

//     // Convert distance to radians (distance / Earth's radius in km)
//     const earthRadiusKm = 6371;
//     const distanceInRadians = distance / earthRadiusKm;

//     // Query to filter opportunities within the given distance
//     const opportunities = await OpportunityList.findAll({
//       where: Sequelize.where(
//         Sequelize.fn(
//           "ST_Distance_Sphere",
//           Sequelize.fn(
//             "POINT",
//             Sequelize.col("longitude"),
//             Sequelize.col("latitude")
//           ),
//           Sequelize.fn("POINT", longitude, latitude)
//         ),
//         { [Op.lte]: distance * 1000 } // Convert distance to meters
//       ),
//       include: [
//         { model: Volunteer, as: "volunteers" },
//         { model: Highlight, as: "highlights" },
//         { model: Service, as: "services" },
//         { model: Review, as: "all_reviews" },
//         // { model: Restriction, as: "restrictions" },
//       ],
//     });

//     res.status(200).json(opportunities);
//   } catch (error) {
//     console.error("Error fetching opportunities by distance:", error);
//     res.status(500).json({
//       message: "Failed to retrieve opportunities by distance",
//       error,
//     });
//   }
// };

// exports.getOpportunitiesByDistance = async (req, res) => {
//   try {
//     const { latitude, longitude, distance } = req.query;

//     if (!latitude || !longitude || !distance) {
//       return res.status(400).json({
//         message: "latitude, longitude, and distance are required",
//       });
//     }

//     const earthRadiusKm = 6371; // Earth's radius in kilometers

//     // Raw SQL query with Haversine formula
//     const query = `
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
//     `;

//     const opportunities = await sequelize.query(query, {
//       replacements: {
//         latitude: parseFloat(latitude),
//         longitude: parseFloat(longitude),
//         distance: parseFloat(distance),
//       },
//       type: sequelize.QueryTypes.SELECT,
//     });

//     res.status(200).json(opportunities);
//   } catch (error) {
//     console.error("Error fetching opportunities by distance:", error);
//     res.status(500).json({
//       message: "Failed to retrieve opportunities by distance",
//       error,
//     });
//   }
// };

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

  const earthRadiusKm = 6371; // Earth's radius in kilometers

  // Raw SQL query with Haversine formula
  const query = `
      SELECT *,
        (${earthRadiusKm} *
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
        ${earthRadiusKm} *
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
  const { page = 1, limit = 10, segments = [] } = req.query;
  let segment2;
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
  if (typeof segments === "string") {
    try {
      // Check if the segments parameter is in stringified JSON format
      if (segments.startsWith("[") && segments.endsWith("]")) {
        segment2 = JSON.parse(segments); // Parse it into an actual array
      } else {
        // If segments is passed as a comma-separated string, split it into an array
        segment2 = segments.split(",").map((segment) => segment.trim());
      }
    } catch (error) {
      return next(new appError("Invalid segments format", 400));
    }
  }

  // Validate that segments is an array
  if (!Array.isArray(segment2)) {
    return next(new appError("Segments must be an array", 400));
  }

  // Calculate offset for pagination
  const offset = (pageNumber - 1) * pageSize;

  // Query the database with pagination and optional segments filter
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: {
      // Filter by segments if provided
      ...(segment2.length > 0 && {
        segments: {
          [Op.overlap]: segment2, // Check if segments array contains any of the values in segmentArray
        },
      }),
    },
    offset, // Skip the first N records
    limit: pageSize, // Return only this many records
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

  // Return paginated results with additional info
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

  // Get current time in seconds and calculate the lower bound
  const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
  const lowerBound = currentTime - rangeInHours * 3600; // Subtract range in seconds

  // Build the time filter condition
  const timeCondition = {
    date_time: {
      [Op.between]: [lowerBound, currentTime],
    },
  };

  // Calculate offset for pagination
  const offset = (pageNumber - 1) * pageSize;

  // Query the database
  const { count, rows } = await OpportunityList.findAndCountAll({
    where: timeCondition,
    offset, // Skip the first N records
    limit: pageSize, // Return only this many records
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

//controller to get the opportunities by different filters

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
    const segmentArray = segments.split(",");
    filters.segments = { [Op.contains]: segmentArray };
  }

  if (suitable_for) {
    const suitableForArray = suitable_for.split(",");
    filters.suitable_for = { [Op.contains]: suitableForArray };
  }

  if (services) {
    const serviceArray = services.split(",");
    filters.services = {
      [Op.or]: serviceArray.map((service) => ({
        [Op.contains]: [{ text: service }],
      })),
    };
  }

  if (highlights) {
    const highlightArray = highlights.split(",");
    filters.highlights = {
      [Op.or]: highlightArray.map((highlight) => ({
        [Op.contains]: [{ text: highlight }],
      })),
    };
  }

  if (donation) {
    const donationValue = parseInt(donation, 10);
    if ([0, 10, 25].includes(donationValue)) {
      filters.donationAmount = donationValue;
    } else {
      return next(
        new appError("Donation must be one of the values: 0, 10, 25", 400)
      );
    }
  }

  const offset = (pageNumber - 1) * pageSize;

  const { count, rows } = await OpportunityList.findAndCountAll({
    where: filters,
    offset,
    limit: pageSize,
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
