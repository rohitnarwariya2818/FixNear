const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "",
    },
    profileImagePublicId: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profession: {
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
    services: [
      {
        type: String,
        trim: true,
      },
    ],

     serviceArea: [
      {
        type: String,
        trim: true,
      },
    ],

    address: {
      type: String,
      trim: true,
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
    workingHours: {
      type: String,
      trim: true,
      default: "",
    },

    experience: {
      type: Number,
      min: 0,
      required: true,
    },

    charges: {
      type: Number,
      required: true,
      min: 0,
    },

    inspectionFee: {
      type: Number,
      min: 0,
      default: 100,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: null,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Provider", providerSchema);
