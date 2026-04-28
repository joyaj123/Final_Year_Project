import mongoose from "mongoose";


const distributionSchema = new mongoose.Schema(
  {
    distributionNumber: { // generated 
      type: String,
      required: true,
      unique: true,
    },

    companyId: { //from the cookies 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["DIVIDEND", "REVENUE_SHARE", "SPECIAL_LIQUIDITY"],
      required: true,
      index: true,
    },

    

   


    // Distribution Amount
    totalAmount: { //all the amount distrivuted to the investors 
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    currency: {
      type: String,
      required: true,
    },


 
    profitAmount: {//Actual profit used to calculate distribution
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    distributionRate: {
      type: Number,
      required: true,
    },

    // Payouts (Embedded Array)
    payouts: [ //array of the investors that will receive the money 
      {
        investorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Investor",
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
          default: "PAID" 
        },

        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transaction",
        },

        paidAt: Date,
      },
    ],
  },
  { timestamps: true }
);


const Distribution = mongoose.model("Distribution", distributionSchema);




export default Distribution;  // 👈 This is crucial for ES modules