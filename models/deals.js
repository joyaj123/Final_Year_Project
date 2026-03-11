import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    dealNumber: {
      type: String,
      required: true,
      unique: true,
    },

    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "investors",
      required: true,
      index: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      required: true,
      index: true,
    },

    completedAt: {
      type: Date,
    },

    // Investment Details (Embedded)
    investment: {
      amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

      currency: {
        type: String,
        required: true,
      },

      sharesAcquired: {
        type: Number,
        required: true,
      },

      ownershipPercentage: {
        type: Number,
        required: true,
      },

      pricePerShare: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

      pricePerPercent: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },
    },

    // Company Snapshot (Denormalized)
    companySnapshot: {
      name: {
        type: String,
        required: true,
      },

      sectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sectors",
        required: true,
      },

      valuation: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },

      arr: {
        type: mongoose.Schema.Types.Decimal128,
      },
    },

    // Payment Info (Embedded)
    payment: {
      method: {
        type: String,
        enum: ["WALLET", "BANK_TRANSFER", "CARD", "CRYPTO"],
        required: true,
      },

      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transactions",
      },

      paidAt: Date,

      paymentReference: String,
    },

    // Admin Actions (Embedded Array)
    adminActions: [
      {
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "admins",
          required: true,
        },

        action: {
          type: String,
          enum: ["APPROVED", "REJECTED", "FLAGGED", "REVIEWED"],
          required: true,
        },

        notes: String,

        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
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