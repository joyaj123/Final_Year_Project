import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Core Identification
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  userType: { 
    type: String, 
    enum: ["INVESTOR", "BUSINESS_OWNER", "ADMIN", "SUPER_ADMIN"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["PENDING", "ACTIVE", "SUSPENDED", "DEACTIVATED"], 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Profile (Embedded Document)
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: Date }, // Conditional, can validate later
    avatarUrl: { type: String },
    timezone: { type: String },
    language: { type: String, default: "en" }
  },

  // Address (Embedded Document)
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: mongoose.Schema.Types.ObjectId , ref : "Countries" ,  required: true },
    postalCode: { type: String }
  },

  // Security (Embedded Document)
  security: {
    twoFactorEnabled: { type: Boolean, required: true, default: false },
    twoFactorSecret: { type: String },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, required: true, default: 0 },
    lockedUntil: { type: Date },
    passwordChangedAt: { type: Date }
  },

  // Preferences (Embedded Document)
  preferences: {
    emailNotifications: { type: Boolean, required: true, default: true },
    smsNotifications: { type: Boolean, required: true, default: false },
    investmentAlerts: { type: Boolean, required: true, default: true },
    dividendAlerts: { type: Boolean, required: true, default: true }
  }
});

const User = mongoose.model("User", userSchema);

export default User;  // 👈 This is crucial for ES modules