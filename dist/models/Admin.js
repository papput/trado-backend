import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["super_admin", "admin", "moderator"],
        default: "admin",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: Date,
}, { timestamps: true });
// ✅ Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// ✅ Compare password method
adminSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};
// ✅ Check if account is locked
adminSchema.methods.isAccountLocked = function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
};
export default mongoose.model("Admin", adminSchema);
