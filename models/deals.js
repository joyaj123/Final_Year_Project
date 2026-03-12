import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    dealNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true,
      index: true,
    },


    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_REVIEW",
        "OPEN",
        "FUNDED",
        "CLOSED",
        "CANCELLED",
      ],
      required: true,
      default: "DRAFT",
      index: true,
    },

    adminStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "FLAGGED"],
      required: true,
      default: "PENDING",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    // Investment Terms
    investmentTerms: {
      targetRaise: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

      currency: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },

      minInvestment: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

      maxInvestment: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },

      equityOfferedPct: {
        type: Number,
        required: true,
      },

      pricePerPercent: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

      pricePerShare: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },

      totalSharesOffered: {
        type: Number,
        default: null,
      },

      valuation: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

      valuationMethod: {
        type: String,
        default: null,
        trim: true,
      },
    },

    // Funding Progress
    fundingProgress: {
      amountRaised: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        default: 0,
      },

      percentageRaised: {
        type: Number,
        required: true,
        default: 0,
      },

      investorCount: {
        type: Number,
        required: true,
        default: 0,
      },

      remainingAmount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },
    },

    // Company Snapshot
    companySnapshot: {
      name: {
        type: String,
        trim: true,
      },

      sectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sectors",
      },

      subsectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subsectors",
        default: null,
      },

      country: {
        type: String,
        default: null,
        trim: true,
      },

      valuation: {
        type: mongoose.Schema.Types.Decimal128,
      },

      arr: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },

      ebitda: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },

      revenue: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },
    },

    // Timeline
    timeline: {
      openDate: {
        type: Date,
        default: null,
      },

      closeDate: {
        type: Date,
        default: null,
      },

      fundingDeadline: {
        type: Date,
        default: null,
      },
    },

    // Admin Review
    adminReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      action: {
        type: String,
        enum: ["APPROVED", "REJECTED", "FLAGGED"],
        default: null,
      },

      notes: {
        type: String,
        default: null,
        trim: true,
      },
    },   
  },
  { timestamps: true }
);

// Pre-save middleware
dealSchema.pre('save', async function(next) {
  try {
    // Check investor
    const investor = await mongoose.model('investors').findById(this.investorId);
    if (!investor) throw new Error(`Investor ${this.investorId} not found`);
    
    // Check company
    const company = await mongoose.model('companies').findById(this.companyId);
    if (!company) throw new Error(`Company ${this.companyId} not found`);
    
    // Check sector
    if (this.companySnapshot?.sectorId) {
      const sector = await mongoose.model('sectors').findById(this.companySnapshot.sectorId);
      if (!sector) throw new Error(`Sector ${this.companySnapshot.sectorId} not found`);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-findOneAndUpdate middleware - FIXED VERSION
dealSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    
    // Check if we're updating investorId
    if (update.investorId) {
      const investor = await mongoose.model('investors').findById(update.investorId);
      if (!investor) throw new Error(`Investor ${update.investorId} not found`);
    }
    
    // Check if we're updating companyId
    if (update.companyId) {
      const company = await mongoose.model('companies').findById(update.companyId);
      if (!company) throw new Error(`Company ${update.companyId} not found`);
    }
    
    // Check if we're updating sectorId in companySnapshot
    if (update['companySnapshot.sectorId']) {
      const sector = await mongoose.model('sectors').findById(update['companySnapshot.sectorId']);
      if (!sector) throw new Error(`Sector ${update['companySnapshot.sectorId']} not found`);
    }
    
    // Handle case where companySnapshot is being updated as an object
    if (update.companySnapshot && update.companySnapshot.sectorId) {
      const sector = await mongoose.model('sectors').findById(update.companySnapshot.sectorId);
      if (!sector) throw new Error(`Sector ${update.companySnapshot.sectorId} not found`);
    }
    
    // Update the updatedAt field
    update.updatedAt = new Date();
    
    next();
  } catch (error) {
    next(error);
  }
});

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;