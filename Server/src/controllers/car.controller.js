import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Car } from "../models/car.model.js";
import { Review } from "../models/review.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    registrationNumber,
  } = req.body;
  let parsedCoordinates = coordinates;
  let parsedFeatures = features;
  if (typeof coordinates === "string") {
    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch {
      parsedCoordinates = null;
    }
  }
  if (typeof features === "string") {
    try {
      parsedFeatures = JSON.parse(features);
    } catch {
      parsedFeatures = [];
    }
  }

  // Validation
  if (
    !brand ||
    !model ||
    !year ||
    !type ||
    !transmission ||
    !fuelType ||
    !seats ||
    !pricePerDay ||
    !location ||
    !parsedCoordinates
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Validate coordinates format
  if (
    !parsedCoordinates.lat ||
    !parsedCoordinates.lon ||
    typeof parsedCoordinates.lat !== "number" ||
    typeof parsedCoordinates.lon !== "number"
  ) {
    throw new ApiError(
      400,
      "Valid coordinates (lat, lon) are required"
    );
  }

  let carImages = [];
  if (req.files?.length) {
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadOnCloudinary(file.path))
    );
    carImages = uploadResults
      .filter(Boolean)
      .map((result) => result.secure_url || result.url)
      .filter(Boolean);
  }

  if (!carImages.length) {
    carImages = [`https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(brand + ' ' + model)}`];
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
    features: parsedFeatures || [],
    location,
    area: area || "",
    images: carImages,
    coordinates: {
      type: "Point",
      coordinates: [parsedCoordinates.lon, parsedCoordinates.lat], // [longitude, latitude]
    },
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
    type,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
    search,
    sortBy,
    page = 1,
    limit = 100, // Increased default limit
  } = req.query;

  let query = { isAvailable: true };
  let useGeoQuery = false;

  // City-based search (exact match) - prioritize over coordinate-based search
  if (city && city !== '' && city !== 'all') {
    query.location = { $regex: new RegExp(city, 'i') }; // Case-insensitive match
    console.log(`🏙️ Filtering by city: ${city}`);
  }
  // Coordinate-based search (radius) - only if no city specified and coordinates provided
  else if (lat && lon && maxDistance) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const distanceInKm = parseFloat(maxDistance);
    
    // Use $geoWithin with $centerSphere for radius search
    // $centerSphere uses radians: distance_in_km / 6378.1 (Earth's radius in km)
    const radiusInRadians = distanceInKm / 6378.1;

    query.coordinates = {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInRadians]
      }
    };
    useGeoQuery = true;
    console.log(`📍 Filtering by coordinates (${latitude}, ${longitude}) within ${distanceInKm}km (${radiusInRadians} radians)`);
  } else {
    // No location filter - show all cars
    console.log(`🌍 Showing all cars (no location filter)`);
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

  console.log('📋 Query:', JSON.stringify(query, null, 2));
  console.log('📊 Pagination: page', page, 'limit', limit, 'skip', skip);

  const cars = await Car.find(query)
    .populate("owner", "fullName email phone rating avatar")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  // Add default images for cars without images
  const carsWithImages = cars.map(car => {
    const carObj = car.toObject();
    if (!carObj.images || carObj.images.length === 0) {
      carObj.images = [`https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(carObj.brand + ' ' + carObj.model)}`];
    }
    return carObj;
  });

  const total = await Car.countDocuments(query);

  console.log(`✅ Found ${carsWithImages.length} cars out of ${total} total matching query`);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        cars: carsWithImages,
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

  // Add default image if car has no images
  const carObj = car.toObject();
  if (!carObj.images || carObj.images.length === 0) {
    carObj.images = [`https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(carObj.brand + ' ' + carObj.model)}`];
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
        car: carObj,
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

  // Add default images for cars without images
  const carsWithImages = cars.map(car => {
    const carObj = car.toObject();
    if (!carObj.images || carObj.images.length === 0) {
      carObj.images = [`https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(carObj.brand + ' ' + carObj.model)}`];
    }
    return carObj;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, carsWithImages, "Owner cars fetched successfully"));
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

  const updates = { ...req.body };

  if (typeof updates.coordinates === "string") {
    try {
      const parsed = JSON.parse(updates.coordinates);
      updates.coordinates = {
        type: "Point",
        coordinates: [parseFloat(parsed.lon), parseFloat(parsed.lat)],
      };
    } catch {
      throw new ApiError(400, "Valid coordinates (lat, lon) are required");
    }
  } else if (updates.coordinates?.lat !== undefined && updates.coordinates?.lon !== undefined) {
    updates.coordinates = {
      type: "Point",
      coordinates: [parseFloat(updates.coordinates.lon), parseFloat(updates.coordinates.lat)],
    };
  }

  if (typeof updates.features === "string") {
    try {
      updates.features = JSON.parse(updates.features);
    } catch {
      updates.features = [];
    }
  }

  ["year", "seats", "pricePerDay"].forEach((field) => {
    if (updates[field] !== undefined && updates[field] !== "") {
      updates[field] = parseFloat(updates[field]);
    } else {
      delete updates[field];
    }
  });

  if (req.files?.length) {
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadOnCloudinary(file.path))
    );
    const uploadedImages = uploadResults
      .filter(Boolean)
      .map((result) => result.secure_url || result.url)
      .filter(Boolean);
    let retainedImages = car.images || [];
    if (typeof updates.existingImages === "string") {
      try {
        retainedImages = JSON.parse(updates.existingImages);
      } catch {
        retainedImages = car.images || [];
      }
    }
    updates.images = [...retainedImages, ...uploadedImages].slice(0, 6);
  }
  if (updates.existingImages !== undefined) {
    if (!req.files?.length) {
      try {
        updates.images = JSON.parse(updates.existingImages).slice(0, 6);
      } catch {
        delete updates.images;
      }
    }
    delete updates.existingImages;
  }

  delete updates.owner;
  delete updates.rating;
  delete updates.totalRatings;
  delete updates.totalBookings;
  delete updates.isAvailable;

  const updatedCar = await Car.findByIdAndUpdate(
    id,
    { $set: updates },
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
