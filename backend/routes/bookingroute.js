// const express = require("express");
// const router = express.Router();

// const {createBooking,getCustomerBookings, getProviderBookings,updateBookingStatus, cancelBooking} = require("../controllers/bookingcontroller.js");

// router.post("/", createBooking);
// router.get("/customer/:customerId", getCustomerBookings);
// router.get("/provider/:providerId" , getProviderBookings);
// router.patch("/:bookingId/status", updateBookingStatus);
// router.patch("/:bookingId/cancel", cancelBooking)

// module.exports = router;



const express = require("express");
const router = express.Router();

const {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    updateBookingStatus,
    submitQuotation,
    respondToQuotation,
    cancelBooking,
    submitUpiReference,
    confirmBookingPayment
} = require("../controllers/bookingcontroller");
const { createBookingReview } = require("../controllers/reviewcontroller");

router.post("/", createBooking);

router.get("/customer/:customerId", getCustomerBookings);

router.get("/provider/:providerId", getProviderBookings);

router.patch("/:bookingId/status", updateBookingStatus);

router.patch("/:bookingId/quotation", submitQuotation);

router.patch("/:bookingId/quotation/respond", respondToQuotation);

router.patch("/:bookingId/cancel", cancelBooking);

router.post("/:bookingId/review", createBookingReview);

router.patch("/:bookingId/payment/upi-reference", submitUpiReference);

router.patch("/:bookingId/payment/confirm", confirmBookingPayment);

module.exports = router;
