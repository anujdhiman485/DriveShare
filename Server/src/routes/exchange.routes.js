import { Router } from "express";
import {
  createExchangeRequest,
  getUserExchangeRequests,
  getReceivedExchangeRequests,
  getExchangeById,
  updateExchangeStatus,
  cancelExchange,
} from "../controllers/exchange.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/create").post(createExchangeRequest);
router.route("/my-requests").get(getUserExchangeRequests);
router.route("/received").get(getReceivedExchangeRequests);
router.route("/:id").get(getExchangeById);
router.route("/:id/status").patch(updateExchangeStatus);
router.route("/:id/cancel").patch(cancelExchange);

export default router;
