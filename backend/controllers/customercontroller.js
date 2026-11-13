const User = require("../models/user");

// GET Customer Profile
const getCustomerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.isAuthenticated?.()) {
            return res.status(401).json({ success: false, message: "Please log in first" });
        }
        if (req.user.role !== "customer" || req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You can only view your own profile" });
        }

        const customer = await User.findOne({
            _id: userId,
            role: "customer"
        }).select("-hash -salt");

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            customer
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch customer profile"
        });
    }
};


// UPDATE Customer Profile
const updateCustomerProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { Name, phone } = req.body;

        if (!req.isAuthenticated?.()) {
            return res.status(401).json({ success: false, message: "Please log in first" });
        }
        if (req.user.role !== "customer" || req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You can only update your own profile" });
        }

        const updateFields = {};

        if (Name !== undefined) {
            if (typeof Name !== "string" || !Name.trim() || Name.trim().length > 50) {
                return res.status(400).json({ success: false, message: "Please provide a valid name" });
            }
            updateFields.Name = Name.trim();
        }

        if (phone !== undefined) {
            const normalizedPhone = String(phone).trim().replace(/[^\d+]/g, "");
            if (!/^\+?\d{7,15}$/.test(normalizedPhone)) {
                return res.status(400).json({ success: false, message: "Please provide a valid phone number" });
            }
            updateFields.phone = normalizedPhone;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update"
            });
        }

        const customer = await User.findOneAndUpdate(
            { _id: userId, role: "customer" },
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-hash -salt");

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer profile updated successfully",
            customer
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Phone number already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update customer profile"
        });
    }
};


module.exports = {
    getCustomerProfile,
    updateCustomerProfile
};
