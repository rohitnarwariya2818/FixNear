// const Booking = require("../models/booking");
// const User = require("../models/user");
// const Provider = require("../models/provider");

// const createBooking = async (req, res) => {
//   try {
//     const { customerId, providerId, service, address, scheduledAt } = req.body;

//     // Validate required fields
//     if (!customerId || !providerId || !service || !address || !scheduledAt) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     // Check whether customer exists
//     const customer = await User.findById(customerId);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     // Check whether provider exists
//     const provider = await Provider.findById(providerId);

//     if (!provider) {
//       return res.status(404).json({
//         success: false,
//         message: "Provider not found",
//       });
//     }

//     // Check whether provider is available
//     if (!provider.isAvailable) {
//       return res.status(400).json({
//         success: false,
//         message: "Provider is currently unavailable",
//       });
//     }

//     // Validate booking date
//     const bookingDate = new Date(scheduledAt);

//     if (Number.isNaN(bookingDate.getTime()) || bookingDate <= new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid future booking date",
//       });
//     }

//     // Create booking
//     const booking = await Booking.create({
//       customer: customerId,
//       provider: providerId,
//       service,
//       address,
//       scheduledAt: bookingDate,
//       charges: provider.charges,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Booking request created successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("Create booking error:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid customer or provider ID",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Unable to create booking",
//     });
//   }
// };

// const getCustomerBookings = async (req, res) => {
//   try {
//     const { customerId } = req.params;

//     if (!customerId) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer ID is required",
//       });
//     }

//     const customer = await User.findById(customerId);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     const bookings = await Booking.find({
//       customer: customerId,
//     })
//       .populate("provider")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: bookings.length,
//       bookings,
//     });
//   } catch (error) {
//     console.error("Get customer bookings error:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid customer ID",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch customer bookings",
//     });
//   }
// };

// const getProviderBookings = async (req, res) => {
//   try {
//     const { providerId } = req.params;

//     if (!providerId) {
//       return res.status(400).json({
//         success: false,
//         message: "Provider ID is required",
//       });
//     }

//     // Check whether provider exists
//     const provider = await Provider.findById(providerId);

//     if (!provider) {
//       return res.status(404).json({
//         success: false,
//         message: "Provider not found",
//       });
//     }

//     // Fetch bookings assigned to this provider
//     const bookings = await Booking.find({
//       provider: providerId,
//     })
//       .populate("customer", "Name Email")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: bookings.length,
//       bookings,
//     });
//   } catch (error) {
//     console.error("Get provider bookings error:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid provider ID",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch provider bookings",
//     });
//   }
// };

// const updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { providerId, status } = req.body;

//     if (!providerId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "Provider Id and status are required",
//       });
//     }

//     // allow only accept and rejectd
//     if (!["accepted", "rejected", "completed"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Status must be accepted ,rejected or completed",
//       });
//     }

//     // find provider
//     const provider = await Provider.findById(providerId);

//     if (!providerId) {
//       return res.status(400)({
//         success: false,
//         message: "provider not found",
//       });
//     }
//     const booking = await Booking.findOne({
//       _id: bookingId,
//       provider: providerId,
//     });

//     if (!booking) {
//       return res.status(400).json({
//         success: false,
//         message: "Booking not found for this provider",
//       });
//     }

//     // only pending booking can be Accepted and rejected

//     if (
//       (booking.status === "pending" &&
//         !["accepted", "rejected"].includes(status)) ||
//       (booking.status === "accepted" && status !== "completed")
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot change booking status from ${booking.status} to ${status}`,
//       });
//     }

//     booking.status = status;

//     if (status === "completed") {
//       booking.completedAt = new Date();
//     }

//     await booking.save();
    

//     return res.status(200).json({
//       success: true,
//       message: `booking ${status} successfully`,
//       booking,
//     });
//   } catch (error) {
//     console.error("Update booking status error:", error);

//     if (error.name === "CastError") {
//       console.error("Get provider bookings error:", error);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid booking or provider ID",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Unable to update booking status",
//     });
//   }
// };

// // cencaltion

// const cancelBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { userId, role } = req.body;

//     if (!userId || !["customer", "provider"].includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID and valid role are required",
//       });
//     }

//     const booking = await Booking.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (!["pending", "accepted"].includes(booking.status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Booking cannot be cancelled because it is ${booking.status}`,
//       });
//     }

//     const isCustomer =
//       role === "customer" && booking.customer.toString() === userId;

//     const isProvider =
//       role === "provider" && booking.provider.toString() === userId;

//     if (!isCustomer && !isProvider) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to cancel this booking",
//       });
//     }

//     booking.status = "cancelled";
//     booking.cancelledBy = role;
//     booking.cancelledAt = new Date();

//     await booking.save();

//     return res.status(200).json({
//       success: true,
//       message: "Booking cancelled successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("Cancel booking error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to cancel booking",
//     });
//   }
// };


// module.exports = {
//   createBooking,
//   getCustomerBookings,
//   getProviderBookings,
//   updateBookingStatus,
//   cancelBooking,
// };


const Booking = require("../models/booking");
const User = require("../models/user");
const Provider = require("../models/provider");


// ==========================================
// 1. CREATE BOOKING
// ==========================================

const createBooking = async (req, res) => {
    try {
        if (!req.isAuthenticated?.()) {
            return res.status(401).json({ success: false, message: "Please log in before booking" });
        }
        if (req.user.role !== "customer") {
            return res.status(403).json({ success: false, message: "Only customer accounts can create bookings" });
        }

        const {
            providerId,
            service,
            bookingType,
            paymentMethod = "cod",
            address,
            scheduledAt,
            description = "",
            latitude,
            longitude,
        } = req.body;

        // Required fields validation
        if (
            !providerId ||
            !service ||
            !bookingType ||
            !address ||
            !scheduledAt
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Validate booking type
        const allowedTypes = ["fix", "inspection", "quotation"];

        if (!allowedTypes.includes(bookingType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking type"
            });
        }
        if (!["cod", "upi"].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: "Choose Cash on Delivery or UPI" });
        }

        // Find provider
        const provider = await Provider.findById(providerId);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        // Check provider availability
        if (!provider.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Provider is currently unavailable"
            });
        }

        if (!(provider.services || []).some((item) => item.toLowerCase() === String(service).trim().toLowerCase())) {
            return res.status(400).json({ success: false, message: "Select a service offered by this provider" });
        }

        const hasLatitude = latitude !== undefined && latitude !== null && latitude !== "";
        const hasLongitude = longitude !== undefined && longitude !== null && longitude !== "";
        if (hasLatitude !== hasLongitude) {
            return res.status(400).json({ success: false, message: "Provide both location coordinates" });
        }
        if (hasLatitude && (
            !Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90 ||
            !Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180
        )) {
            return res.status(400).json({ success: false, message: "Location coordinates are invalid" });
        }

        // Validate booking date
        const bookingDate = new Date(scheduledAt);

        if (
            Number.isNaN(bookingDate.getTime()) ||
            bookingDate <= new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid future booking date"
            });
        }

        // Dynamic pricing
        let charges = 0;
        let inspectionFee = 0;
        let quotationStatus = "not_required";

        if (bookingType === "fix") {
            charges = provider.charges;
        }

        else if (bookingType === "inspection") {
            inspectionFee = provider.inspectionFee ?? 100;
            charges = inspectionFee;
        }

        else if (bookingType === "quotation") {
            charges = 0;
            quotationStatus = "pending";
        }

        // Create booking
        const booking = await Booking.create({
            customer: req.user._id,
            provider: providerId,
            service,
            bookingType,
            paymentMethod,
            address: address.trim(),
            description: String(description).trim(),
            latitude: hasLatitude ? Number(latitude) : null,
            longitude: hasLongitude ? Number(longitude) : null,
            scheduledAt: bookingDate,
            charges,
            inspectionFee,
            quotationStatus
        });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking
        });

    } catch (error) {
        console.error("Create booking error:", error);

        if (
            error.name === "CastError" ||
            error.name === "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create booking"
        });
    }
};


// ==========================================
// 2. GET CUSTOMER BOOKINGS
// ==========================================

const getCustomerBookings = async (req, res) => {
    try {
        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        const { customerId } = req.params;
        if (req.user.role !== "customer" || req.user._id.toString() !== customerId) {
            return res.status(403).json({ success: false, message: "You can only view your own bookings" });
        }

        const bookings = await Booking.find({
            customer: customerId
        })
            .populate({ path: "provider", populate: { path: "user", select: "Name" } })
            .populate("review", "rating comment createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error("Get customer bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch customer bookings"
        });
    }
};


// ==========================================
// 3. GET PROVIDER BOOKINGS
// ==========================================

const getProviderBookings = async (req, res) => {
    try {
        const { providerId } = req.params;

        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        if (req.user.role !== "provider") return res.status(403).json({ success: false, message: "Provider account required" });
        const provider = await Provider.findOne({ user: req.user._id });

        if (!provider || provider._id.toString() !== providerId) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        const bookings = await Booking.find({
            provider: providerId
        })
            .populate("customer", "Name Email phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error("Get provider bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch provider bookings"
        });
    }
};


// ==========================================
// 4. UPDATE BOOKING STATUS
// ==========================================

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        if (req.user.role !== "provider") return res.status(403).json({ success: false, message: "Provider account required" });
        const provider = await Provider.findOne({ user: req.user._id });
        if (!provider) return res.status(404).json({ success: false, message: "Provider profile not found" });

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Booking status is required"
            });
        }

        if (!["accepted", "rejected", "completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status"
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            provider: provider._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Validate status transition
        if (
            booking.status === "pending" &&
            !["accepted", "rejected"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid status transition"
            });
        }

        if (
            booking.status === "accepted" &&
            status !== "completed"
        ) {
            return res.status(400).json({
                success: false,
                message: "Accepted booking can only be completed"
            });
        }

        if (booking.status !== "pending" && booking.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message: `Booking is already ${booking.status}`
            });
        }

        // Quotation must be accepted before completion
        if (
            status === "completed" &&
            booking.bookingType === "quotation" &&
            booking.quotationStatus !== "accepted"
        ) {
            return res.status(400).json({
                success: false,
                message: "Customer must accept quotation before completion"
            });
        }

        booking.status = status;

        if (status === "completed") {
            booking.completedAt = new Date();
        }

        await booking.save();

        return res.status(200).json({
            success: true,
            message: `Booking ${status} successfully`,
            booking
        });

    } catch (error) {
        console.error("Update booking status error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update booking status"
        });
    }
};


// ==========================================
// 5. PROVIDER SUBMITS QUOTATION
// ==========================================

const submitQuotation = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { quotationAmount } = req.body;

        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        if (req.user.role !== "provider") return res.status(403).json({ success: false, message: "Provider account required" });
        const provider = await Provider.findOne({ user: req.user._id });
        if (!provider) return res.status(404).json({ success: false, message: "Provider profile not found" });

        if (
            quotationAmount === undefined ||
            !Number.isFinite(Number(quotationAmount)) ||
            Number(quotationAmount) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid quotation amount is required"
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            provider: provider._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.bookingType !== "quotation") {
            return res.status(400).json({
                success: false,
                message: "This booking does not require a quotation"
            });
        }

        if (booking.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message: "Provider must accept booking before submitting quotation"
            });
        }

        if (booking.quotationStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Quotation has already been submitted or processed"
            });
        }

        booking.quotationAmount = Number(quotationAmount);

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Quotation submitted successfully",
            booking
        });

    } catch (error) {
        console.error("Submit quotation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit quotation"
        });
    }
};


// ==========================================
// 6. CUSTOMER ACCEPTS OR REJECTS QUOTATION
// ==========================================

const respondToQuotation = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { decision } = req.body;

        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        if (req.user.role !== "customer") return res.status(403).json({ success: false, message: "Customer account required" });

        if (
            !["accepted", "rejected"].includes(decision)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid quotation decision is required"
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            customer: req.user._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.bookingType !== "quotation") {
            return res.status(400).json({
                success: false,
                message: "Quotation is not applicable to this booking"
            });
        }

        if (
            booking.status !== "accepted" ||
            booking.quotationAmount === null ||
            booking.quotationStatus !== "pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "No pending quotation is available"
            });
        }

        booking.quotationStatus = decision;

        if (decision === "accepted") {
            booking.charges = booking.quotationAmount;
        }

        await booking.save();

        return res.status(200).json({
            success: true,
            message: `Quotation ${decision} successfully`,
            booking
        });

    } catch (error) {
        console.error("Respond to quotation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process quotation response"
        });
    }
};


// ==========================================
// 7. CANCEL BOOKING
// ==========================================

const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        const role = req.user.role;
        if (!["customer", "provider"].includes(role)) return res.status(403).json({ success: false, message: "Customer or provider account required" });

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (!["pending", "accepted"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: "This booking cannot be cancelled"
            });
        }

        const isCustomer =
            role === "customer" &&
            booking.customer.toString() === req.user._id.toString();

        const provider = role === "provider" ? await Provider.findOne({ user: req.user._id }) : null;

        const isProvider =
            role === "provider" &&
            provider && booking.provider.toString() === provider._id.toString();

        if (!isCustomer && !isProvider) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this booking"
            });
        }

        booking.status = "cancelled";
        booking.cancelledBy = role;
        booking.cancelledAt = new Date();

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking
        });

    } catch (error) {
        console.error("Cancel booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel booking"
        });
    }
};

const submitUpiReference = async (req, res) => {
    try {
        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        if (req.user.role !== "customer") return res.status(403).json({ success: false, message: "Customer account required" });

        const reference = typeof req.body.transactionReference === "string"
            ? req.body.transactionReference.trim()
            : "";
        if (!/^[A-Za-z0-9._/-]{6,100}$/.test(reference)) {
            return res.status(400).json({ success: false, message: "Enter a valid UPI transaction reference (6–100 characters)" });
        }

        const booking = await Booking.findOne({ _id: req.params.bookingId, customer: req.user._id });
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        if (booking.paymentMethod !== "upi") return res.status(400).json({ success: false, message: "This booking is set to Cash on Delivery" });
        if (!["accepted", "completed"].includes(booking.status)) {
            return res.status(400).json({ success: false, message: "UPI payment is available after the provider accepts the booking" });
        }
        if (booking.bookingType === "quotation" && booking.quotationStatus !== "accepted") {
            return res.status(400).json({ success: false, message: "Accept the provider's quotation before paying" });
        }
        if (booking.charges <= 0) return res.status(400).json({ success: false, message: "There is no payment amount due yet" });
        if (booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "This booking has already been marked paid" });

        booking.paymentReference = reference;
        booking.paymentStatus = "pending_verification";
        await booking.save();
        return res.status(200).json({ success: true, message: "UPI reference submitted for provider verification", booking });
    } catch (error) {
        if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid booking ID" });
        console.error("Submit UPI reference error:", error);
        return res.status(500).json({ success: false, message: "Unable to save UPI payment reference" });
    }
};

const confirmBookingPayment = async (req, res) => {
    try {
        if (!req.isAuthenticated?.()) return res.status(401).json({ success: false, message: "Please log in first" });
        if (req.user.role !== "provider") return res.status(403).json({ success: false, message: "Provider account required" });

        const provider = await Provider.findOne({ user: req.user._id });
        if (!provider) return res.status(404).json({ success: false, message: "Provider profile not found" });
        const booking = await Booking.findOne({ _id: req.params.bookingId, provider: provider._id });
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        if (booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "Payment is already marked paid" });
        if (["cancelled", "rejected"].includes(booking.status)) return res.status(400).json({ success: false, message: "Cannot confirm payment for a cancelled or rejected booking" });

        if (booking.paymentMethod === "upi" && booking.paymentStatus !== "pending_verification") {
            return res.status(400).json({ success: false, message: "There is no UPI reference waiting for verification" });
        }
        if (booking.paymentMethod === "cod" && booking.status !== "completed") {
            return res.status(400).json({ success: false, message: "Confirm cash after completing the service" });
        }

        booking.paymentStatus = "paid";
        booking.paymentConfirmedAt = new Date();
        await booking.save();
        return res.status(200).json({ success: true, message: "Payment marked as received", booking });
    } catch (error) {
        if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid booking ID" });
        console.error("Confirm booking payment error:", error);
        return res.status(500).json({ success: false, message: "Unable to confirm payment" });
    }
};


// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================

module.exports = {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    updateBookingStatus,
    submitQuotation,
    respondToQuotation,
    cancelBooking,
    submitUpiReference,
    confirmBookingPayment
};
