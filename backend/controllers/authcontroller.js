const User = require("../models/user");
const Provider = require("../models/provider");
const cloudinary = require("../config/cloudinary");

const publicUser = (user) => ({
  id: user._id,
  Name: user.Name,
  Email: user.Email,
  role: user.role,
  phone: user.phone,
  address: user.address || "",
  profileImage: user.profileImage || "",
});

const toList = (value) =>
  (Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [])
    .map((item) => String(item).trim())
    .filter(Boolean);

const toNumber = (value) =>
  value === undefined || value === null || value === "" ? Number.NaN : Number(value);

const uploadProviderImage = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "FixNear/Providers",
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "fill" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(file.buffer);
  });

const uploadAccountImage = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "FixNear/Profiles",
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "fill" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(file.buffer);
  });

const signup = async (req, res) => {
  let registeredUser;
  let uploadedImage;
  let providerCreated = false;

  try {
    const {
      Name,
      Email,
      Password,
      ConfirmPassword,
      Phone,
      role,
      providerProfile: rawProviderProfile,
    } = req.body;

    if (
      !Name?.trim() ||
      !Email?.trim() ||
      !Password ||
      !ConfirmPassword ||
      !Phone?.trim() ||
      !["customer", "provider"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid name, email, password, confirmation, phone, and account type",
      });
    }

    if (Password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (Password !== ConfirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const normalizedEmail = Email.trim().toLowerCase();
    const normalizedPhone = Phone.trim().replace(/[^\d+]/g, "");
    if (!/^\+?\d{7,15}$/.test(normalizedPhone)) {
      return res.status(400).json({ success: false, message: "Please provide a valid phone number" });
    }

    let profileFields;
    if (role === "provider") {
      let details = rawProviderProfile;
      if (typeof details === "string") {
        try {
          details = JSON.parse(details);
        } catch {
          return res.status(400).json({ success: false, message: "Provider details are invalid" });
        }
      }

      const services = toList(details?.services);
      const serviceArea = toList(details?.serviceArea);
      const experience = toNumber(details?.experience);
      const charges = toNumber(details?.charges);
      const inspectionFee = details?.inspectionFee === undefined
        ? 100
        : toNumber(details.inspectionFee);
      const latitude = toNumber(details?.latitude);
      const longitude = toNumber(details?.longitude);

      if (
        !req.file ||
        !details?.profession?.trim() ||
        services.length === 0 ||
        !details?.description?.trim() ||
        !details?.address?.trim() ||
        serviceArea.length === 0 ||
        !Number.isFinite(experience) || experience < 0 ||
        !Number.isFinite(charges) || charges < 0 ||
        !Number.isFinite(inspectionFee) || inspectionFee < 0 ||
        !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
        typeof details.isAvailable !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "Complete all required provider details, including a profile photo and valid coordinates",
        });
      }

      profileFields = {
        profession: details.profession.trim(),
        services,
        experience,
        description: details.description.trim(),
        address: details.address.trim(),
        latitude,
        longitude,
        serviceArea,
        charges,
        inspectionFee,
        isAvailable: details.isAvailable,
        workingHours: details.workingHours?.trim() || "",
        phone: normalizedPhone,
      };
    }

    const scopedUsername = `${role}:${normalizedEmail}`;
    const existingUser = await User.findOne({
      $or: [
        { Email: normalizedEmail, role },
        { username: scopedUsername },
        { phone: normalizedPhone, role },
      ],
    }).select("+username");
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.Email === normalizedEmail || existingUser.username === scopedUsername
          ? "An account already exists with this email"
          : "An account already exists with this phone number",
      });
    }

    if (role === "provider") {
      uploadedImage = await uploadProviderImage(req.file);
    }

    const newUser = new User({
      Name: Name.trim(),
      Email: normalizedEmail,
      username: scopedUsername,
      role,
      phone: normalizedPhone,
    });
    registeredUser = await User.register(newUser, Password);

    let provider = null;
    if (role === "provider") {
      try {
        provider = await Provider.create({
          ...profileFields,
          user: registeredUser._id,
          profileImage: uploadedImage.secure_url,
          profileImagePublicId: uploadedImage.public_id,
        });
        providerCreated = true;
      } catch (providerError) {
        await User.deleteOne({ _id: registeredUser._id });
        registeredUser = null;
        throw providerError;
      }
    }

    await new Promise((resolve, reject) => {
      req.login(registeredUser, (loginError) => {
        if (loginError) reject(loginError);
        else resolve();
      });
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: publicUser(registeredUser),
      provider,
    });
  } catch (error) {
    if (registeredUser && !providerCreated) {
      await User.deleteOne({ _id: registeredUser._id }).catch(() => {});
    }
    if (uploadedImage && !providerCreated) {
      await cloudinary.uploader.destroy(uploadedImage.public_id).catch(() => {});
    }

    console.error("Signup error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];
      const message = duplicateField === "phone"
        ? "An account already exists with this phone number"
        : duplicateField === "Email" || duplicateField === "username"
          ? "An account already exists with this email"
          : "A unique account value is already registered";
      return res.status(409).json({ success: false, message });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to create your account. Please try again.",
    });
  }
};

const login = async (req, res) => {
  const { Email, Password, role } = req.body;
  if (!Email || !Password || !["customer", "provider"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Please provide your email, password, and a valid account type",
    });
  }

  const normalizedEmail = Email.trim().toLowerCase();
  User.authenticate()(`${role}:${normalizedEmail}`, Password, async (error, user) => {
    if (error) {
      console.error("Login error:", error);
      return res.status(500).json({ success: false, message: "Unable to log in right now" });
    }
    if (!user) {
      try {
        const sameRoleAccount = await User.findOne({ Email: normalizedEmail, role }).select("_id");
        if (sameRoleAccount) {
          return res.status(401).json({ success: false, message: "Invalid email and password" });
        }
        const otherRoleAccount = await User.findOne({ Email: normalizedEmail, role: { $ne: role } }).select("role");
        if (otherRoleAccount) {
          return res.status(403).json({
            success: false,
            message: `This email has a separate ${otherRoleAccount.role} account. Choose that account type or use the ${role} password for this account.`,
          });
        }
      } catch (lookupError) {
        console.error("Login account lookup error:", lookupError);
        return res.status(500).json({ success: false, message: "Unable to log in right now" });
      }
      return res.status(401).json({ success: false, message: "Invalid email and password" });
    }
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}. Choose the matching account type to log in.`,
      });
    }

    req.login(user, (loginError) => {
      if (loginError) {
        console.error("Create login session error:", loginError);
        return res.status(500).json({ success: false, message: "Unable to create a login session" });
      }
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: publicUser(user),
      });
    });
  });
};

const getCurrentUser = (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ success: false, message: "Please log in to continue" });
  }
  return res.status(200).json({ success: true, user: publicUser(req.user) });
};

const getProfile = async (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ success: false, message: "Please log in to continue" });
  }

  try {
    const user = await User.findById(req.user._id).select("-hash -salt");
    if (!user) return res.status(404).json({ success: false, message: "Account not found" });

    let account = publicUser(user);
    if (user.role === "provider") {
      const provider = await Provider.findOne({ user: user._id });
      if (provider) {
        account = {
          ...account,
          profileImage: provider.profileImage || account.profileImage,
          address: provider.address || account.address,
          profession: provider.profession,
          services: provider.services,
          experience: provider.experience,
          description: provider.description,
          serviceArea: provider.serviceArea,
          latitude: provider.latitude,
          longitude: provider.longitude,
          charges: provider.charges,
          inspectionFee: provider.inspectionFee,
          isAvailable: provider.isAvailable,
          workingHours: provider.workingHours,
        };
      }
    }

    return res.status(200).json({ success: true, user: account });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: "Unable to load your profile" });
  }
};

const updateProfile = async (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ success: false, message: "Please log in to continue" });
  }

  let uploadedImage;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "Account not found" });

    const name = req.body.Name?.trim();
    const email = req.body.Email?.trim().toLowerCase();
    const phone = req.body.phone?.trim().replace(/[^\d+]/g, "");
    const address = req.body.address?.trim();
    const previousImageId = user.role === "provider"
      ? (await Provider.findOne({ user: user._id }))?.profileImagePublicId
      : user.profileImagePublicId;

    if (name !== undefined && (!name || name.length > 50)) {
      return res.status(400).json({ success: false, message: "Name must be between 1 and 50 characters" });
    }
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (phone !== undefined && !/^\+?\d{7,15}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid phone number" });
    }
    if (address !== undefined && address.length > 500) {
      return res.status(400).json({ success: false, message: "Address cannot be longer than 500 characters" });
    }
    if (email !== undefined) {
      const scopedUsername = `${user.role}:${email}`;
      const emailOwner = await User.findOne({
        $or: [{ Email: email, role: user.role }, { username: scopedUsername }],
        _id: { $ne: user._id },
      }).select("_id");
      if (emailOwner) return res.status(409).json({ success: false, message: "That email address is already in use" });
    }
    if (phone !== undefined) {
      const phoneOwner = await User.findOne({ phone, role: user.role, _id: { $ne: user._id } }).select("_id");
      if (phoneOwner) return res.status(409).json({ success: false, message: "That phone number is already in use" });
      if (user.role === "provider") {
        const providerPhoneOwner = await Provider.findOne({ phone, user: { $ne: user._id } }).select("_id");
        if (providerPhoneOwner) return res.status(409).json({ success: false, message: "That phone number is already used by a provider" });
      }
    }

    if (name !== undefined) user.Name = name;
    if (email !== undefined) {
      user.Email = email;
      user.username = `${user.role}:${email}`;
    }
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    if (req.file) uploadedImage = await uploadAccountImage(req.file);

    let provider = null;
    if (user.role === "provider") {
      provider = await Provider.findOne({ user: user._id });
      if (provider) {
        if (phone !== undefined) provider.phone = phone;
        if (address !== undefined) provider.address = address;
        if (uploadedImage) {
          provider.profileImage = uploadedImage.secure_url;
          provider.profileImagePublicId = uploadedImage.public_id;
        }
        await provider.save();
      }
    }

    if (uploadedImage && user.role === "customer") {
      user.profileImage = uploadedImage.secure_url;
      user.profileImagePublicId = uploadedImage.public_id;
    }
    await user.save();

    if (uploadedImage && previousImageId && previousImageId !== uploadedImage.public_id) {
      await cloudinary.uploader.destroy(previousImageId).catch((cleanupError) => {
        console.warn("Could not remove previous profile image:", cleanupError.message);
      });
    }

    const account = publicUser(user);
    if (provider) {
      account.profileImage = provider.profileImage || account.profileImage;
      account.address = provider.address || account.address;
    }
    return res.status(200).json({ success: true, message: "Profile updated successfully", user: account });
  } catch (error) {
    if (uploadedImage) await cloudinary.uploader.destroy(uploadedImage.public_id).catch(() => {});
    console.error("Update profile error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
      return res.status(409).json({
        success: false,
        message: field === "phone" ? "That phone number is already in use" : "That email address is already in use",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Unable to update your profile" });
  }
};

const logout = (req, res) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return res.status(500).json({ success: false, message: "Unable to log out" });
    }
    if (!req.session) {
      res.clearCookie("connect.sid");
      return res.status(200).json({ success: true, message: "Logged out" });
    }
    req.session.destroy((sessionError) => {
      if (sessionError) {
        return res.status(500).json({ success: false, message: "Unable to end login session" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ success: true, message: "Logged out" });
    });
  });
};

module.exports = { signup, login, getCurrentUser, getProfile, updateProfile, logout };
