import mongoose from "mongoose";


const distributionSchema = new mongoose.Schema(
  {
    distributionNumber: {
      type: String,
      required: true,
      unique: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["DIVIDEND", "REVENUE_SHARE", "SPECIAL_LIQUIDITY"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["SCHEDULED", "PROCESSING", "COMPLETED"],
      required: true,
      index: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },

    processedAt: Date,

    // Distribution Amount
    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    currency: {
      type: String,
      required: true,
    },

    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    profitAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    distributionRate: {
      type: Number,
      required: true,
    },

    // Payouts (Embedded Array)
    payouts: [
      {
        investorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "investors",
          required: true,
        },

        ownershipPercentage: {
          type: Number,
          required: true,
        },

        amount: {
          type: mongoose.Schema.Types.Decimal128,
          required: true,
        },

        status: {
          type: String,
          enum: ["PENDING", "PROCESSING", "PAID", "FAILED"],
          required: true,
        },

        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "transactions",
        },

        paidAt: Date,
      },
    ],
  },
  { timestamps: true }
);


distributionSchema.pre('save', async function(next) {
  try {
    // Check company exists
    const company = await mongoose.model('companies').findById(this.companyId);
    if (!company) throw new Error(`Company ${this.companyId} not found`);
    
    // Check all investors in payouts exist
    if (this.payouts && this.payouts.length > 0) {//LOOP LA2ENNO payouts is an array , bas wahad ykoun mch mawjoud bi wa2ef 
      for (let i = 0; i < this.payouts.length; i++) {
        const payout = this.payouts[i];
        const investor = await mongoose.model('investors').findById(payout.investorId);
        if (!investor) throw new Error(`Investor ${payout.investorId} in payout #${i+1} not found`);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Distribution = mongoose.model("Distribution", distributionSchema);




export default Distribution;  // 👈 This is crucial for ES modules