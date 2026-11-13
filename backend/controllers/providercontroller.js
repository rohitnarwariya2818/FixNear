const Provider = require("../models/provider");

// provider register Api
const registerprovider = async (req, res) => {
  try {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({
        success: false,
        message: "Please log in as a provider first",
      });
    }

    const user = req.user;
    if (user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only provider accounts can create a provider profile",
      });
    }

    const {
      profession,
      services,
      experience,
      serviceArea,
      charges,
      inspectionFee = 100,
      // phone,
      isAvailable = true,
    } = req.body;
    const toList = (value) =>
      (Array.isArray(value)
        ? value
        : typeof value === "string"
          ? value.split(",")
          : [])
        .map((item) => String(item).trim())
        .filter(Boolean);
    const serviceList = toList(services);
    const serviceAreaList = toList(serviceArea);

    if (
      !profession?.trim() ||
      serviceList.length === 0 ||
      serviceAreaList.length === 0 ||
      !Number.isFinite(Number(experience)) ||
      Number(experience) < 0 ||
      !Number.isFinite(Number(charges)) ||
      Number(charges) < 0 ||
      !Number.isFinite(Number(inspectionFee)) ||
      Number(inspectionFee) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid provider profile details",
      });
    }

    const existingProvider = await Provider.findOne({ user: user._id });

    if (existingProvider) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists",
      });
    }

    // Create provider profile
    const provider = await Provider.create({
      user: user._id,
      profession: profession.trim(),
      services: serviceList,
      experience: Number(experience),
      serviceArea: serviceAreaList,
      charges: Number(charges),
      inspectionFee: Number(inspectionFee),
      // phone: phone?.trim() || user.phone,
      isAvailable: Boolean(isAvailable),
    });

    return res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      provider,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A provider profile already uses this phone number",
        
      });
      
      
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid provider data",
        detail: error.message,
        
      });
    }

    console.error("Provider registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getting provider profile

const getProviderProfile = async (req, res) => {
  try {
    const { providerId } = req.params;
    let provider = await Provider.findById(providerId).populate(
      "user",
      "Name Email",
    );

    if (!provider) {
      provider = await Provider.findOne({ user: providerId }).populate(
        "user",
        "Name Email",
      );
    }

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Provider profile fetched successfully",
      provider,
    });
  } catch (error) {
    console.error("get provider profile error", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const updateProviderProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const updateFields = [
//       "profession",
//       "services",
//       "experience",
//       "serviceArea",
//       "charges",
//       "isAvailable",
//     ];

//     const update = {};

//     for (const field of updateFields) {
//       if (req.body[field] !== undefined) update[field] = req.body[field];

//       if (Object.keys(update).length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "please provide at leaste one field to update",
//         });
//       }

//       const provider = await Provider.findOneAndUpdate(
//         { user: userId },
//         { $set: update },
//         {new:true, runValidators: true },
//       );

//       if (!provider) {
//         return res.status(404).json({
//           success: false,
//           message: "Provider profile not",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         meassage: "Provider profile update Successfully",
//         provider,
//       });
//     }
//   } catch (error) {
//     console.error("update provider profile error:", error);

//     return res.status(400).json({
//       success: false,
//       message: "Unable to update provider profile",
//     });
//   }
// };

// all provider lisit and search
const updateProviderProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ success: false, message: "Please log in first" });
    }

    if (req.user.role !== "provider" || req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You can only update your own provider profile" });
    }

    const updateFields = [
      "profession",
      "services",
      "experience",
      "serviceArea",
      "charges",
      "inspectionFee",
      "phone",
      "isAvailable",
    ];

    const update = {};

    for (const field of updateFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    // Check if at least one field is provided
    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    const provider = await Provider.findOneAndUpdate(
      { user: userId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      provider,
    });

  } catch (error) {
    console.error("Update provider profile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A provider profile already uses this phone number",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update provider profile",
      error: error.message,
    });
  }
};



const getProviderByLocation = async (req, res) => {
  try {
    const { location, profession } = req.query;
    const filter = {
      isAvailable: true,
    };

    if (location) {
      filter.serviceArea = {
        $regex: loaction.trim(),
        $option: "i",
      };
    }

    if (profession) {
      filter.profession = {
        $regex: profession.trim(),
        $options: "i",
      };
    }

    const providers = await Provider.find(filter)
      .populate("user", "Name Email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: filter.length,
      providers,
    });
  } catch (error) {
    console.error("get all providers error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch providers",
    });
  }
};

// GET ALL PROVIDERS
const getAllProviders = async (req, res) => {
  try {
    const { profession, location } = req.query;

    // Build filter dynamically
    const filter = {
      isAvailable: true
    };

    if (profession) {
      filter.profession = {
        $regex: profession,
        $options: "i"
      };
    }

    if (location) {
      filter.serviceArea = {
        $regex: location,
        $options: "i"
      };
    }

    const providers = await Provider.find(filter)
      .populate("user", "Name Email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });

  } catch (error) {
    console.error("Get All Providers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
      error: error.message
    });
  }
};

const cloudinary = require("../config/cloudinary");
const { error } = require("node:console");

const uploadProfileImage = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ success: false, message: "Please log in first" });
    }

    if (req.user.role !== "provider") {
      return res.status(403).json({ success: false, message: "Only providers can upload a provider image" });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const provider = await Provider.findOne({ _id: providerId, user: req.user._id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "FixNear/Providers",
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "fill" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    provider.profileImage = result.secure_url;
    provider.profileImagePublicId = result.public_id;

    await provider.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profileImage: provider.profileImage,
    });

  } catch (error) {
    console.error("Profile Image Upload Error:", error);

    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};



module.exports = {
  registerprovider,
  getProviderProfile,
  updateProviderProfile,
  getProviderByLocation,
  getAllProviders,
  uploadProfileImage,
};
