import mongoose from "mongoose";

const financialHistorySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    periodType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUAL"],
      required: true,
      index: true
    },

    periodStart: {
      type: Date,
      required: true,
      index: true
    },

    periodEnd: {
      type: Date,
      required: true
    },

    reportedAt: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "FLAGGED"],
      required: true,
      index: true
    },

    revenue: {
      gross: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
      },
      net: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
      },
      recurring: {
        type: mongoose.Schema.Types.Decimal128
      }
    },

    expenses: {
      operating: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
      },
      cogs: {
        type: mongoose.Schema.Types.Decimal128
      },
      marketing: {
        type: mongoose.Schema.Types.Decimal128
      },
      payroll: {
        type: mongoose.Schema.Types.Decimal128
      }
    },

    profit: {
      gross: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
      },
      net: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
      },
      ebitda: {
        type: mongoose.Schema.Types.Decimal128
      }
    },

    metrics: {
      customerCount: Number,
      churnRate: Number,
      mauCount: Number
    },

    currency: {
      type: String,
      required: true
    },

    documents: [
      {
        type: {
          type: String,
          enum: ["BANK_STATEMENT", "P_AND_L", "BALANCE_SHEET"],
          required: true
        },
        fileUrl: {
          type: String,
          required: true
        },
        uploadedAt: {
          type: Date,
          required: true,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const FinancialHistory = mongoose.model("FinancialHistory", financialHistorySchema);
export default FinancialHistory;