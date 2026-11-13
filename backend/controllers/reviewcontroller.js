const mongoose = require("mongoose");
const Booking = require("../models/booking");
const Provider = require("../models/provider");
const Review = require("../models/review");

const createBookingReview = async (req, res) => {
  try {
    if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
    if (req.user.role !== "customer") return res.status(403).json({ success: false, message: "Only customers can review a provider" });

    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Choose a rating from 1 to 5 stars" });
    }
    if (comment.length > 1000) return res.status(400).json({ success: false, message: "Review must be 1,000 characters or fewer" });

    const booking = await Booking.findOne({ _id: req.params.bookingId, customer: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "completed") return res.status(400).json({ success: false, message: "You can review the provider after the service is completed" });
    if (booking.review) return res.status(409).json({ success: false, message: "You have already reviewed this booking" });

    const review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      rating,
      comment,
    });
    booking.review = review._id;
    await booking.save();

    const [stats] = await Review.aggregate([
      { $match: { provider: booking.provider } },
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await Provider.updateOne(
      { _id: booking.provider },
      { $set: { ratingAverage: Number(stats.average.toFixed(2)), reviewCount: stats.count } },
    );

    return res.status(201).json({ success: true, message: "Thank you for reviewing your provider", review });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "You have already reviewed this booking" });
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid booking" });
    console.error("Create booking review error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit your review" });
  }
};

const getProviderReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.providerId)) {
      return res.status(400).json({ success: false, message: "Invalid provider ID" });
    }
    const provider = await Provider.findById(req.params.providerId).select("_id ratingAverage reviewCount");
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

    const reviews = await Review.find({ provider: provider._id })
      .populate("customer", "Name profileImage")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({
      success: true,
      ratingAverage: provider.ratingAverage,
      reviewCount: provider.reviewCount,
      reviews,
    });
  } catch (error) {
    console.error("Get provider reviews error:", error);
    return res.status(500).json({ success: false, message: "Unable to load provider reviews" });
  }
};

module.exports = { createBookingReview, getProviderReviews };
