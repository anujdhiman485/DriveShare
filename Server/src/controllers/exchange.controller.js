import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Exchange } from "../models/exchange.model.js";
import { Car } from "../models/car.model.js";

// Create exchange request
const createExchangeRequest = asyncHandler(async (req, res) => {
  const { requestedCarId, offeredCarId, startDate, endDate, message, exchangeLocation } = req.body;

  if (!requestedCarId || !offeredCarId || !startDate || !endDate) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Check if both cars exist
  const [requestedCar, offeredCar] = await Promise.all([
    Car.findById(requestedCarId),
    Car.findById(offeredCarId),
  ]);

  if (!requestedCar || !offeredCar) {
    throw new ApiError(404, "One or both cars not found");
  }

  // Check if user owns the offered car
  if (offeredCar.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only offer your own car for exchange");
  }

  // Check if user is trying to exchange with their own car
  if (requestedCar.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot exchange with your own car");
  }

  // Check if cars are available for exchange
  if (!requestedCar.isAvailable || !offeredCar.isAvailable) {
    throw new ApiError(400, "One or both cars are not available");
  }

  if (
    requestedCar.availableFor === "rent" ||
    offeredCar.availableFor === "rent"
  ) {
    throw new ApiError(400, "One or both cars are not available for exchange");
  }

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) {
    throw new ApiError(400, "End date must be after start date");
  }

  const exchange = await Exchange.create({
    requestedCar: requestedCarId,
    offeredCar: offeredCarId,
    requester: req.user._id,
    owner: requestedCar.owner,
    startDate: start,
    endDate: end,
    totalDays,
    message: message || "",
    exchangeLocation: exchangeLocation || requestedCar.location,
  });

  const populatedExchange = await Exchange.findById(exchange._id)
    .populate("requestedCar", "brand model year images location")
    .populate("offeredCar", "brand model year images location")
    .populate("owner", "fullName email phone avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedExchange, "Exchange request created successfully"));
});

// Get user's exchange requests (as requester)
const getUserExchangeRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = { requester: req.user._id };

  if (status && status !== "all") {
    query.status = status;
  }

  const exchanges = await Exchange.find(query)
    .populate("requestedCar", "brand model year images location")
    .populate("offeredCar", "brand model year images location")
    .populate("owner", "fullName email phone avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, exchanges, "Exchange requests fetched successfully"));
});

// Get received exchange requests (as owner)
const getReceivedExchangeRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = { owner: req.user._id };

  if (status && status !== "all") {
    query.status = status;
  }

  const exchanges = await Exchange.find(query)
    .populate("requestedCar", "brand model year images location")
    .populate("offeredCar", "brand model year images location")
    .populate("requester", "fullName email phone avatar rating")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, exchanges, "Received exchanges fetched successfully"));
});

// Get exchange by ID
const getExchangeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exchange = await Exchange.findById(id)
    .populate("requestedCar")
    .populate("offeredCar")
    .populate("owner", "fullName email phone avatar rating")
    .populate("requester", "fullName email phone avatar rating");

  if (!exchange) {
    throw new ApiError(404, "Exchange request not found");
  }

  // Check if user is part of this exchange
  if (
    exchange.requester._id.toString() !== req.user._id.toString() &&
    exchange.owner._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to view this exchange");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, exchange, "Exchange details fetched successfully"));
});

// Update exchange status (owner only)
const updateExchangeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, ownerResponse } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const validStatuses = ["pending", "accepted", "rejected", "ongoing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const exchange = await Exchange.findById(id);

  if (!exchange) {
    throw new ApiError(404, "Exchange request not found");
  }

  // Check if user is the owner
  if (exchange.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this exchange");
  }

  exchange.status = status;
  if (ownerResponse) {
    exchange.ownerResponse = ownerResponse;
  }
  await exchange.save();

  const updatedExchange = await Exchange.findById(id)
    .populate("requestedCar", "brand model year images")
    .populate("offeredCar", "brand model year images")
    .populate("requester", "fullName email phone avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedExchange, "Exchange status updated successfully"));
});

// Cancel exchange
const cancelExchange = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const exchange = await Exchange.findById(id);

  if (!exchange) {
    throw new ApiError(404, "Exchange request not found");
  }

  // Check if user is part of this exchange
  if (
    exchange.requester.toString() !== req.user._id.toString() &&
    exchange.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to cancel this exchange");
  }

  if (exchange.status === "completed" || exchange.status === "cancelled") {
    throw new ApiError(400, "Cannot cancel this exchange");
  }

  exchange.status = "cancelled";
  exchange.cancellationReason = reason || "";
  await exchange.save();

  return res
    .status(200)
    .json(new ApiResponse(200, exchange, "Exchange cancelled successfully"));
});

export {
  createExchangeRequest,
  getUserExchangeRequests,
  getReceivedExchangeRequests,
  getExchangeById,
  updateExchangeStatus,
  cancelExchange,
};
