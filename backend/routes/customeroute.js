const express = require("express");
const router = express.Router();

const {
    getCustomerProfile,
    updateCustomerProfile
} = require("../controllers/customercontroller");

router.get("/profile/:userId", getCustomerProfile);

router.put("/profile/:userId", updateCustomerProfile);

module.exports = router;