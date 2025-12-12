import mongoose, { Schema } from "mongoose";

const exchangeSchema = new Schema(
  {
    requestedCar: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    offeredCar: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    exchangeLocation: {
      type: String,
      trim: true,
    },
    ownerResponse: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exchangeSchema.index({ requestedCar: 1, status: 1 });
exchangeSchema.index({ offeredCar: 1, status: 1 });
exchangeSchema.index({ requester: 1, status: 1 });
exchangeSchema.index({ owner: 1, status: 1 });

export const Exchange = mongoose.model("Exchange", exchangeSchema);
