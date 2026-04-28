import mongoose from "mongoose";


const ownershipRecordSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "TRANSFERRED", "LIQUIDATED"],
      required: true,
    },

    createdAt: {
      type: Date,
      required: true,
    },

    updatedAt: {
      type: Date,
      required: true,
    },

    // Ownership Details
    totalShares: {
      type: Number,
      required: true,
    },

    ownershipPercentage: {
      type: Number,
      required: true,
    },

    totalInvested: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    averageCostPerShare: {
      type: mongoose.Schema.Types.Decimal128,

    },

    currentValue: {
      type: mongoose.Schema.Types.Decimal128,
    },

    unrealizedGainLoss: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0,
    },

    totalReturnsReceived: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0,
    },

    currency: {
      type: String,
      required: true,
    },

    // Acquisition History (Embedded Array)
    acquisitions: [
      {
        dealId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Deal",
          required: true,
        },

        shares: {
          type: Number,
          required: true,
        },

        pricePerShare: {
          type: mongoose.Schema.Types.Decimal128,
        },

        amount: {
          type: mongoose.Schema.Types.Decimal128,
          required: true,
        },

        acquiredAt: {
          type: Date,
          required: true,
        },

        type: {
          type: String,
          enum: ["PRIMARY", "SECONDARY"],
          required: true,
        },
      },
    ],
  },
  { timestamps: false }
);


const Ownership = mongoose.models.Ownership || mongoose.model("Ownership", ownershipRecordSchema);
export default Ownership;