import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/review.model.js";
import { Car } from "../models/car.model.js";
import { Booking } from "../models/booking.model.js";

// Create a review
const createReview = asyncHandler(async (req, res) => {
  const { carId, bookingId, rating, comment, reviewType } = req.body;

  if (!carId || !rating || !comment) {
    throw new ApiError(400, "Car ID, rating, and comment are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const car = await Car.findById(carId);

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  // Check if user has booked this car (optional verification)
  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.renter.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You can only review cars you have booked");
    }
    if (booking.status !== "completed") {
      throw new ApiError(400, "You can only review completed bookings");
    }
  }

  // Check if user already reviewed this car
  const existingReview = await Review.findOne({
    car: carId,
    reviewer: req.user._id,
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this car");
  }

  const review = await Review.create({
    car: carId,
    reviewer: req.user._id,
    booking: bookingId || null,
    rating,
    comment,
    reviewType: reviewType || "car",
  });

  // Update car rating
  const allReviews = await Review.find({ car: carId });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / allReviews.length;

  await Car.findByIdAndUpdate(carId, {
    rating: avgRating,
    totalRatings: allReviews.length,
  });

  const populatedReview = await Review.findById(review._id).populate(
    "reviewer",
    "fullName avatar rating"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedReview, "Review created successfully"));
});

// Get reviews for a car
const getCarReviews = asyncHandler(async (req, res) => {
  const { carId } = req.params;

  const reviews = await Review.find({ car: carId })
    .populate("reviewer", "fullName avatar rating")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

// Get user's reviews
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewer: req.user._id })
    .populate("car", "brand model year images")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "User reviews fetched successfully"));
});

// Delete review
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is the reviewer
  if (review.reviewer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this review");
  }

  await Review.findByIdAndDelete(id);

  // Update car rating
  const allReviews = await Review.find({ car: review.car });
  if (allReviews.length > 0) {
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;
    await Car.findByIdAndUpdate(review.car, {
      rating: avgRating,
      totalRatings: allReviews.length,
    });
  } else {
    await Car.findByIdAndUpdate(review.car, {
      rating: 0,
      totalRatings: 0,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export { createReview, getCarReviews, getUserReviews, deleteReview };
