const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { signup, login, getCurrentUser, getProfile, updateProfile, logout } = require("../controllers/authcontroller");

router.post("/signup", upload.single("profileImage"), signup);
// Keep the old misspelled endpoint working for existing callers.
router.post("/singup", upload.single("profileImage"), signup);
router.post("/login", login);
router.get("/me", getCurrentUser);
router.get("/profile", getProfile);
router.put("/profile", upload.single("profileImage"), updateProfile);
router.post("/logout", logout);

module.exports = router;
