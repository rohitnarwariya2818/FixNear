const express = require('express');
const router = express.Router();
const upload = require("../config/multer");


const { registerprovider,getProviderProfile,updateProviderProfile,getProviderByLocation,getAllProviders,uploadProfileImage } = require("../controllers/providercontroller.js"); 
const { getProviderReviews } = require("../controllers/reviewcontroller");


router.post("/register" , registerprovider);
router.get("/profile/:providerId/reviews", getProviderReviews);
router.get("/profile/:providerId", getProviderProfile);
router.patch("/profile/:userId",updateProviderProfile);
router.get("/providers", getAllProviders);
router.get("/",getProviderByLocation);
router.post("/:providerId/profile-image",upload.single("profileImage"),uploadProfileImage);



module.exports= router;
