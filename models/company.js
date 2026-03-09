import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["DRAFT" ,"PENDING_REVIEW", "APPROVED" ,"REJECTED", "FUNDED", "CLOSED"],
      default: "PENDING_REVIEW",
      required: true,
      index: true,
    },

    listingType: {
      type: String,
      enum: ["EQUITY" , "REVENUE_SHARE" , "HYBRID"],
      required: true,
    },

 
    details: {
      description: { type: String, required: true },
      shortDescription: { type: String },
      foundedDate: { type: Date },
      businessModel: { type: String },
      website: { type: String },
    },

   
    classification: {
      sectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sector",
        required: true,
      },
      businessType: {
        type: String,
        required: true,
      },
    },

    tags: [String],

    funding: {
      targetAmount: { type: mongoose.Schema.Types.Decimal128, required: true },
      minimumInvestment: { type: mongoose.Schema.Types.Decimal128, required: true },
      equityOffered: { type: Number, required: true }, 
      pricePerPercent: { type: mongoose.Schema.Types.Decimal128, required: true },
      totalShares: { type: Number, required: true },
      sharePrice: { type: mongoose.Schema.Types.Decimal128, required: true },
      amountRaised: { type: mongoose.Schema.Types.Decimal128, default: 0.0 },
      investorCount: { type: Number, default: 0 },
      fundingStartDate: { type: Date, required: true },
      fundingDeadline: { type: Date, required: true },
    },
  },
  { timestamps: true } 
);

const Company = mongoose.model("Company", companySchema);

export default Company;