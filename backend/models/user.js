const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const passportLocalMongoose = plm.default || plm;

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: [true, "Please enter your name"],
        maxlength: [50, "Name cannot be longer than 50 characters"],
        trim: true,
    },

    Email: {
        type: String,
        required: [true, "Please enter your email"],
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
            "Please enter a valid email"
        ]
    },

    // Keep this field populated for databases created by the earlier
    // Passport setup, which may still have a unique `username` index.
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        select: false,
    },

    role: {
        type: String,
        enum: ["customer", "provider"],
        default: "customer"
    },

    phone: {
    type: String,
    required:true,
    trim: true,
    default: undefined,
},
    profileImage: {
        type: String,
        trim: true,
        default: "",
    },
    profileImagePublicId: {
        type: String,
        default: "",
},
    address: {
        type: String,
        trim: true,
        maxlength: [500, "Address cannot be longer than 500 characters"],
        default: "",
    },
}, { autoIndex: false });

userSchema.index({ Email: 1, role: 1 }, { unique: true, name: "Email_role_unique" });
userSchema.index(
    { phone: 1, role: 1 },
    { unique: true, partialFilterExpression: { phone: { $type: "string" } }, name: "phone_role_unique" },
);


userSchema.plugin(passportLocalMongoose, {
    usernameField: "username",
    usernameLowerCase: true,
});

module.exports = mongoose.model("User", userSchema);
