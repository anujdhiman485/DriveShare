import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Car } from "../models/car.model.js";
import { Review } from "../models/review.model.js";

// Create a new car listing
const createCar = asyncHandler(async (req, res) => {
  console.log('📝 Create car request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user?._id);

  const {
    brand,
    model,
    year,
    type,
    transmission,
    fuelType,
    seats,
    pricePerDay,
    description,
    features,
    location,
    area,
    coordinates,
    availableFor,
    registrationNumber,
  } = req.body;

  // Validation
  if (
    !brand ||
    !model ||
    !year ||
    !type ||
    !transmission ||
    !fuelType ||
    !seats ||
    (availableFor !== 'exchange' && !pricePerDay) ||
    !location ||
    !coordinates
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Validate coordinates format
  if (
    !coordinates.lat ||
    !coordinates.lon ||
    typeof coordinates.lat !== "number" ||
    typeof coordinates.lon !== "number"
  ) {
    throw new ApiError(
      400,
      "Valid coordinates (lat, lon) are required"
    );
  }

  const car = await Car.create({
    owner: req.user._id,
    brand,
    model,
    year,
    type,
    transmission,
    fuelType,
    seats,
    pricePerDay,
    description: description || "",
    features: features || [],
    location,
    area: area || "",
    coordinates: {
      type: "Point",
      coordinates: [coordinates.lon, coordinates.lat], // [longitude, latitude]
    },
    availableFor: availableFor || "rent",
    registrationNumber: registrationNumber || "",
  });

  console.log('✅ Car created successfully:', car._id);

  return res
    .status(201)
    .json(new ApiResponse(201, car, "Car created successfully"));
});

// Get all cars with location-based filtering
const getAllCars = asyncHandler(async (req, res) => {
  const {
    lat,
    lon,
    maxDistance,
    city,
    availableFor,
    type,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
    search,
    sortBy,
    page = 1,
    limit = 20,
  } = req.query;

  let query = { isAvailable: true };

  // City-based search (exact match) - prioritize over coordinate-based search
  if (city) {
    query.location = { $regex: new RegExp(city, 'i') }; // Case-insensitive match
    console.log(`🏙️ Filtering by city: ${city}`);
  }
  // Coordinate-based search (radius) - only if no city specified
  else if (lat && lon && maxDistance) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const distance = parseFloat(maxDistance) * 1000; // Convert km to meters

    query.coordinates = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: distance,
      },
    };
    console.log(`📍 Filtering by coordinates within ${maxDistance}km`);
  }

  // Filter by availability type
  if (availableFor && availableFor !== "all") {
    if (availableFor === "both") {
      query.availableFor = "both";
    } else {
      query.$or = [
        { availableFor: availableFor },
        { availableFor: "both" }
      ];
    }
  }

  // Filter by car type
  if (type) {
    query.type = type;
  }

  // Filter by transmission
  if (transmission) {
    query.transmission = transmission;
  }

  // Filter by fuel type
  if (fuelType) {
    query.fuelType = fuelType;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  // Search by brand, model, location, or area
  if (search) {
    query.$or = [
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
    ];
  }

  // Sorting
  let sortOptions = {};
  if (sortBy === "price-low") {
    sortOptions.pricePerDay = 1;
  } else if (sortBy === "price-high") {
    sortOptions.pricePerDay = -1;
  } else if (sortBy === "rating") {
    sortOptions.rating = -1;
  } else {
    sortOptions.createdAt = -1; // Default: newest first
  }

  const skip = (page - 1) * limit;

  const cars = await Car.find(query)
    .populate("owner", "fullName email phone rating avatar")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Car.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        cars,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "Cars fetched successfully"
    )
  );
});

// Get car by ID
const getCarById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const car = await Car.findById(id).populate(
    "owner",
    "fullName email phone rating avatar location city"
  );

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  // Get reviews for this car
  const reviews = await Review.find({ car: id })
    .populate("reviewer", "fullName avatar rating")
    .sort({ createdAt: -1 })
    .limit(10);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        car,
        reviews,
      },
      "Car details fetched successfully"
    )
  );
});

// Get cars by owner
const getCarsByOwner = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  console.log('🚗 Fetching cars for owner:', ownerId);

  const cars = await Car.find({ owner: ownerId }).sort({ createdAt: -1 });

  console.log(`Found ${cars.length} cars for owner`);

  return res
    .status(200)
    .json(new ApiResponse(200, cars, "Owner cars fetched successfully"));
});

// Update car
const updateCar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const car = await Car.findById(id);

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  // Check if user is the owner
  if (car.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this car");
  }

  // Update coordinates format if provided
  if (req.body.coordinates) {
    req.body.coordinates = {
      type: "Point",
      coordinates: [req.body.coordinates.lon, req.body.coordinates.lat],
    };
  }

  const updatedCar = await Car.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCar, "Car updated successfully"));
});

// Delete car
const deleteCar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const car = await Car.findById(id);

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  // Check if user is the owner
  if (car.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this car");
  }

  await Car.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Car deleted successfully"));
});

// Toggle car availability
const toggleCarAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const car = await Car.findById(id);

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  // Check if user is the owner
  if (car.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this car");
  }

  car.isAvailable = !car.isAvailable;
  await car.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, car, `Car is now ${car.isAvailable ? "available" : "unavailable"}`)
    );
});

export {
  createCar,
  getAllCars,
  getCarById,
  getCarsByOwner,
  updateCar,
  deleteCar,
  toggleCarAvailability,
};
