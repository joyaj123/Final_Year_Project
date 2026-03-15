import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAWAL", "INVESTMENT", "DISTRIBUTION"],
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
      required: true,
      index: true
    },

    completedAt: {
      type: Date
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType",
      index: true
    },

    senderType: {
      type: String,
      enum: ["Investor", "Company", "Platform", "External"]
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverType",
      index: true
    },

    receiverType: {
      type: String,
      enum: ["Investor", "Company", "Platform", "External"]
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },

    currency: {
      type: String,
      required: true
    },

    fee: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0
    },

    netAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },

    exchangeRate: {
      type: Number
    },

    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      index: true
    },

    distributionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distribution"
    },

    parentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    },

    paymentDetails: {
      method: { //here for deposit from bank_transfer 
        type: String,
        enum: ["BANK_TRANSFER", "CARD", "CRYPTO", "WALLET", "ACH", "WIRE"],
        required: true
      },

      externalReference: String,

      bankName: String,

      last4: String,

      processorResponse: mongoose.Schema.Types.Mixed
    },

    description: String,

    notes: String,

    ipAddress: String,

    userAgent: String
  },
  {
    timestamps: true 
  }
);

transactionSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "COMPLETED" && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});
//Ce hook met automatiquement la date completedAt quand le statut d’une transaction devient "COMPLETED" au moment de la sauvegarde

transactionSchema.pre("save", function(next) {
  if (!this.isNew && this.status === "COMPLETED" && this.isModified("amount")) {
    return next(new Error("Cannot modify amount after completion"));
  }
  next();
});
//Hook pour empêcher modification après COMPLETED

transactionSchema.post("save", function(doc) {
  if (doc.status === "COMPLETED") {
    console.log("Transaction completed, send notification");
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;