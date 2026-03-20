import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Core Identification
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, //done
  userType: { 
    type: String, 
    enum: ["INVESTOR", "BUSINESS_OWNER", "ADMIN", "SUPER_ADMIN"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["PENDING", "ACTIVE", "SUSPENDED", "DEACTIVATED"],  //done
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
    country: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "countries",  
    required: true,
    validate: {
      validator: async function(value) {
        const Country = mongoose.model('countries');
        const country = await Country.findById(value);
        return !!country; // Returns true if country exists
      },
      message: 'Country with ID {VALUE} does not exist'
    }
  },
    postalCode: { type: String }
  },

  // Security (Embedded Document)
  security: {
    /*twoFactorEnabled: { type: Boolean, required: true, default: false },
    twoFactorSecret: { type: String },*/
    lastLogin: { type: Date }, //done
    failedLoginAttempts: { type: Number, required: true, default: 0 },//done
    lockedUntil: { type: Date }, //done 
    passwordChangedAt: { type: Date }, 
    resetOTP: {type : String}, //done,added this
    resetOTPExpiry: {type : Date} //done,added this 
  },

  // Preferences (Embedded Document)
  preferences: {
    emailNotifications: { type: Boolean, required: true, default: true },
    smsNotifications: { type: Boolean, required: true, default: false },
    investmentAlerts: { type: Boolean, required: true, default: true },
    dividendAlerts: { type: Boolean, required: true, default: true }
  }
});


userSchema.pre("save", async function () {
  // Hash password if it was modified or is new
  if (this.isModified("passwordHash")) {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
  }

  // Validate country ObjectId
  if (!mongoose.Types.ObjectId.isValid(this.address.country)) {
    throw new Error("Invalid country ObjectId");
  }

  // plus besoin de next()
});


const User = mongoose.model("User", userSchema);

export default User;  // 👈 This is crucial for ES modules