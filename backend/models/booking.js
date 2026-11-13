const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    service: {
      type: String,
      required: true,
      trim: true,
    },

    bookingType: {
      type: String,
      enum: ["fix", "inspection", "quotation"],
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    charges: {
      type: Number,
      required: true,
      min: 0,
    },

    inspectionFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    quotationAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    quotationStatus: {
      type: String,
      enum: ["not_required", "pending", "accepted", "rejected"],
      default: "not_required",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "upi"],
      default: "cod",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending_verification", "paid"],
      default: "unpaid",
      required: true,
    },

    paymentReference: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    paymentConfirmedAt: {
      type: Date,
      default: null,
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    cancelledBy: {
      type: String,
      enum: ["customer", "provider"],
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("booking", BookingSchema);
