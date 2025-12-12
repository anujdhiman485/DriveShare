import { Router } from "express";
import {
  createCar,
  getAllCars,
  getCarById,
  getCarsByOwner,
  updateCar,
  deleteCar,
  toggleCarAvailability,
} from "../controllers/car.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes - MUST come before parameterized routes
router.route("/create").post(verifyJWT, createCar);
router.route("/my-cars").get(verifyJWT, getCarsByOwner);

// Public routes
router.route("/").get(getAllCars);

// Parameterized routes - MUST come last to avoid catching specific routes
router.route("/:id").get(getCarById);
router.route("/:id/update").patch(verifyJWT, updateCar);
router.route("/:id/delete").delete(verifyJWT, deleteCar);
router.route("/:id/toggle-availability").patch(verifyJWT, toggleCarAvailability);

export default router;
