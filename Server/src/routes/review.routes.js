import { Router } from "express";
import {
  createReview,
  getCarReviews,
  getUserReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/car/:carId").get(getCarReviews);

// Protected routes
router.route("/create").post(verifyJWT, createReview);
router.route("/my-reviews").get(verifyJWT, getUserReviews);
router.route("/:id/delete").delete(verifyJWT, deleteReview);

export default router;
