import mongoose from "mongoose";

// Reuse the same WalletSchema as the investor
const WalletSchema = new mongoose.Schema(
  {
    balance: { type: mongoose.Schema.Types.Decimal128, required: true, default: 0 },
    currency: { type: String, required: true, default: "USD" }, // ISO 4217
    lockedBalance: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    totalInvested: { type: mongoose.Schema.Types.Decimal128, required: true, default: 0 },
    totalReturns: { type: mongoose.Schema.Types.Decimal128, required: true, default: 0 },
  },
  { _id: false }
);

// Company schema
const CompanySchema = new mongoose.Schema(
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
      index: true,
    },

    slug: {
      type: String,
      required: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
      unique: true,
    },

    incorporationDate: {
      type: Date,
    },

    incorporationCountry: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "FUNDED", "CLOSED"],
      default: "PENDING_REVIEW",
      required: true,
      index: true,
    },

    listingType: {
      type: String,
      enum: ["EQUITY", "REVENUE_SHARE", "HYBRID"],
      required: true,
    },

    approvedAt: {
      type: Date,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    details: {
      description: { type: String, required: true },
      shortDescription: { type: String, required: true },
      foundedDate: { type: Date, required: true },
      businessModel: { type: String, required: true },
      website: { type: String, required: true },
      logoUrl: { type: String },
      coverImageUrl: { type: String },
      videoUrl: { type: String },
    },

    classification: {
      sectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sectors",
        required: true,
        index: true,
      },

      subSectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subsector",
      },

      businessType: {
        type: String,
        enum: ["E_COMMERCE", "SAAS", "CONTENT", "MARKETPLACE", "AGENCY", "EDUCATION"],
        required: true,
        index: true,
      },

      tags: [String],
    },

    funding: {
      targetAmount: { type: mongoose.Schema.Types.Decimal128, required: true },
      minimumInvestment: { type: mongoose.Schema.Types.Decimal128, required: true },
      maximumInvestment: { type: mongoose.Schema.Types.Decimal128 },
      currency: { type: String, required: true, default:0 },
      equityOffered: { type: Number, required: true },
      pricePerPercent: { type: mongoose.Schema.Types.Decimal128 },
      totalShares: { type: Number, required: true },
      sharePrice: { type: mongoose.Schema.Types.Decimal128 },
      amountRaised: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      investorCount: { type: Number, default: 0 },
      fundingStartDate: { type: Date, required: true },
      fundingDeadline: { type: Date, required: true },
    },

    financials: {
      arr: { type: mongoose.Schema.Types.Decimal128, required: true },
      mrr: { type: mongoose.Schema.Types.Decimal128 },
      grossRevenue: { type: mongoose.Schema.Types.Decimal128, required: true },
      netIncome: { type: mongoose.Schema.Types.Decimal128, required: true },
      grossMargin: { type: Number },
      netMargin: { type: Number },
      expenses: { type: mongoose.Schema.Types.Decimal128, required: true },
      ebitda: { type: mongoose.Schema.Types.Decimal128 },
      asOfDate: { type: Date, required: true },
      currency: { type: String, required: true ,default:0},
      audited: { type: Boolean, required: true },
    },
    

    valuation: {
      preMoneyValuation: { type: mongoose.Schema.Types.Decimal128, required: true },
      postMoneyValuation: { type: mongoose.Schema.Types.Decimal128, required: true },
      valuationMethod: { type: String, required: false },
      revenueMultiple: { type: Number },
      ebitdaMultiple: { type: Number },
      valuedAt: { type: Date, required: true },
      valuedBy: { type: String },
    },

    team: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        bio: { type: String },
        linkedinUrl: { type: String },
        imageUrl: { type: String },
      },
    ],

    documents: [
      {
        type: {
          type: String,
          enum: ["PITCH_DECK", "FINANCIALS", "LEGAL", "INCORPORATION", "TAX_RETURNS"],
          required: true,
        },
        name: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        visibility: {
          type: String,
          enum: ["PUBLIC", "INVESTORS_ONLY", "ADMIN_ONLY"],
          required: true,
        },
      },
    ],

    metrics: {
      employeeCount: { type: Number, required: true },
      customerCount: { type: Number },
      monthlyActiveUsers: { type: Number },
      churnRate: { type: Number },
      growthRate: { type: Number },
    },

    isListing: {
      type: Boolean,
      default: false,
    },


    // ✅ Wallet like Investor
    wallet: { type: WalletSchema, required: true, default: () => ({}) },
  },
  { timestamps: true }
);

CompanySchema.pre('save',async function(){
  try{

    if(this.classification?.sectorId){
      const sector = await mongoose.model('Sector').findById(this.classification.sectorId);
      if (!sector) throw new Error(`Sector ${this.classification.sectorId} not found`);
    }
    if (this.classification?.subsectorId) {
      const subsector = await mongoose.model('Subsector').findById(this.classification.subsectorId);
      if (!subsector) throw new Error(`Subsector ${this.classification.subsectorId} not found`);
    }
    } catch (error) {
       console.log(error.message) ; 
    }
});

const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);
export default Company;
