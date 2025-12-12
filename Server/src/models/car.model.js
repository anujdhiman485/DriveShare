import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const carSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["sedan", "suv", "hatchback", "luxury", "sports", "electric"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid"],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String, // cloudinary URLs
      },
    ],
    description: {
      type: String,
      trim: true,
      default: "",
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
      default: "",
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    availableFor: {
      type: String,
      enum: ["rent", "exchange", "both"],
      default: "rent",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    insuranceValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
carSchema.index({ coordinates: "2dsphere" });
carSchema.index({ location: 1 });
carSchema.index({ availableFor: 1 });
carSchema.index({ isAvailable: 1 });

carSchema.plugin(mongooseAggregatePaginate);

export const Car = mongoose.model("Car", carSchema);
