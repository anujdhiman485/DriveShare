import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.model.js";
import { Car } from "../models/car.model.js";

// Create a new booking
const createBooking = asyncHandler(async (req, res) => {
  const { carId, startDate, endDate, message, pickupLocation } = req.body;

  if (!carId || !startDate || !endDate) {
    throw new ApiError(400, "Car ID, start date, and end date are required");
  }

  const car = await Car.findById(carId);

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  if (!car.isAvailable) {
    throw new ApiError(400, "Car is not available for booking");
  }

  // Check if user is trying to book their own car
  if (car.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot book your own car");
  }

  // Calculate total days and price
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) {
    throw new ApiError(400, "End date must be after start date");
  }

  const totalPrice = totalDays * car.pricePerDay;

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    car: carId,
    status: { $in: ["pending", "confirmed", "ongoing"] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } },
    ],
  });

  if (overlappingBooking) {
    throw new ApiError(400, "Car is already booked for these dates");
  }

  const booking = await Booking.create({
    car: carId,
    renter: req.user._id,
    owner: car.owner,
    startDate: start,
    endDate: end,
    totalDays,
    pricePerDay: car.pricePerDay,
    totalPrice,
    message: message || "",
    pickupLocation: pickupLocation || car.location,
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate("car", "brand model year images location")
    .populate("owner", "fullName email phone avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedBooking, "Booking created successfully"));
});

// Get user's bookings (as renter)
const getUserBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = { renter: req.user._id };

  if (status && status !== "all") {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate("car", "brand model year images location pricePerDay")
    .populate("owner", "fullName email phone avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
});

// Get received booking requests (as owner)
const getReceivedBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = { owner: req.user._id };

  if (status && status !== "all") {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate("car", "brand model year images location pricePerDay")
    .populate("renter", "fullName email phone avatar rating")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Received bookings fetched successfully"));
});

// Get booking by ID
const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate("car")
    .populate("owner", "fullName email phone avatar rating")
    .populate("renter", "fullName email phone avatar rating");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is part of this booking
  if (
    booking.renter._id.toString() !== req.user._id.toString() &&
    booking.owner._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to view this booking");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking details fetched successfully"));
});

// Update booking status (owner only)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const validStatuses = ["pending", "confirmed", "ongoing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is the owner
  if (booking.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this booking");
  }

  booking.status = status;
  await booking.save();

  // Update car's total bookings if confirmed
  if (status === "confirmed") {
    await Car.findByIdAndUpdate(booking.car, {
      $inc: { totalBookings: 1 },
    });
  }

  const updatedBooking = await Booking.findById(id)
    .populate("car", "brand model year images")
    .populate("renter", "fullName email phone avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBooking, "Booking status updated successfully"));
});

// Cancel booking
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is part of this booking
  if (
    booking.renter.toString() !== req.user._id.toString() &&
    booking.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to cancel this booking");
  }

  if (booking.status === "completed" || booking.status === "cancelled") {
    throw new ApiError(400, "Cannot cancel this booking");
  }

  booking.status = "cancelled";
  booking.cancellationReason = reason || "";
  await booking.save();

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

export {
  createBooking,
  getUserBookings,
  getReceivedBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
