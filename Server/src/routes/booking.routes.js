import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getReceivedBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/create").post(createBooking);
router.route("/my-bookings").get(getUserBookings);
router.route("/received").get(getReceivedBookings);
router.route("/:id").get(getBookingById);
router.route("/:id/status").patch(updateBookingStatus);
router.route("/:id/cancel").patch(cancelBooking);

export default router;
