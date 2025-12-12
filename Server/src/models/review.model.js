import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    car: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    reviewType: {
      type: String,
      enum: ["car", "owner"],
      default: "car",
    },
    images: [
      {
        type: String, // cloudinary URLs
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ car: 1 });
reviewSchema.index({ reviewer: 1 });

export const Review = mongoose.model("Review", reviewSchema);
