import Company from "../models/Company.js";
import mongoose from "mongoose";
import Ownership from "../models/ownership.js";
import Distribution from "../models/distributions.js";
import Transaction from "../models/Transaction.js";
import Investor from "../models/Investor.js"; 

const getAllDistributions = async (req, res) => {
  try {
    const distributions = await Distribution.find({})
    .populate("companyId" , "name")
     .populate({
        path: 'payouts.investorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      }) 
    .populate("payouts.transactionId" , "transactionNumber");
    res.status(200).json(distributions);
  } catch (error) {
    console.error("ERROR IN FETCHING DISTRIBUTIONS", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE A DISTRIBUTION 
const postDistribution = async (req, res) => {
  try {
    const distribution = await Distribution.create(req.body);
    res.status(201).json(distribution);
  } catch (error) {
    console.error("Error creating distribution:", error);
    res.status(500).json({ message: error.message });
  }
};

const getDistribution = async (req, res) => {
  try {
    const distribution = await Distribution.findById(req.params.id)
    .populate("companyId" , "name")
     .populate({
        path: 'payouts.investorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      }) 
    .populate("payouts.transactionId" , "transactionNumber");

    if (!distribution) {
      return res.status(404).json({ message: "Distribution not found" });
    }
    res.status(200).json(distribution);
  } catch (error) {
    console.error("Error fetching distribution:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE A DISTRIBUTION 
const putDistribution = async (req, res) => {
  try {
    const distribution = await Distribution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!distribution) {
      return res.status(404).json({ message: "Distribution not found" });
    }

    res.status(200).json(distribution);
  } catch (error) {
    console.error("Error updating distribution:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE A DISTRIBUTION 
const deleteDistribution = async (req, res) => {
  try {
    const distribution = await Distribution.findByIdAndDelete(req.params.id);
    if (!distribution) {
      return res.status(404).json({ message: "Distribution not found" });
    }
    res.status(200).json({ message: "Distribution deleted successfully" });
  } catch (error) {
    console.error("Error deleting distribution:", error);
    res.status(500).json({ message: error.message });
  }
};


export const createDistribution = async (req, res) => {
  try {
    const { totalAmount, type, currency } = req.body;

    const userId = req.userId;

    // 1) Get company
    const company = await Company.findOne({ ownerId: userId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const companyId = company._id;

    // Ensure wallet exists
    if (!company.wallet) company.wallet = {};
    if (!company.wallet.balance) {
      company.wallet.balance = mongoose.Types.Decimal128.fromString("0");
    }

    const companyBalance = parseFloat(company.wallet.balance.toString());

    if (companyBalance < totalAmount) {
      return res.status(400).json({
        message: "Not enough balance",
      });
    }

    // 2) Get ownerships
    const ownerships = await Ownership.find({
      companyId,
      status: "ACTIVE",
    }).populate("investorId");

    if (!ownerships.length) {
      return res.status(404).json({
        message: "No investors found",
      });
    }

    // 3) Check ownership = 1
    const totalOwnership = ownerships.reduce(
      (sum, o) => sum + Number(o.ownershipPercentage),
      0
    );

    if (Math.abs(totalOwnership - 1) > 0.01) {
      return res.status(400).json({
        message: `Ownership must equal 1, got ${totalOwnership}`,
      });
    }

    // 4) Deduct from company
    const newCompanyBalance = companyBalance - totalAmount;

    company.wallet.balance =
      mongoose.Types.Decimal128.fromString(newCompanyBalance.toString());

    company.markModified("wallet");
    await company.save();

    const payouts = [];

    // 5) Loop investors
    for (const o of ownerships) {
      const amount = totalAmount * o.ownershipPercentage;

      const investor = o.investorId;
      if (!investor) continue;

      // Ensure investor wallet
      if (!investor.wallet) investor.wallet = {};
      if (!investor.wallet.balance) {
        investor.wallet.balance =
          mongoose.Types.Decimal128.fromString("0");
      }

      const currentBalance = parseFloat(
        investor.wallet.balance.toString()
      );

      const newBalance = currentBalance + amount;

      investor.wallet.balance =
        mongoose.Types.Decimal128.fromString(newBalance.toString());

      investor.markModified("wallet");
      await investor.save();

      // Create transaction
      const transaction = await Transaction.create({
        transactionNumber:
          "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 1000),

        type: "DISTRIBUTION",
        status: "COMPLETED",

        senderId: companyId,
        senderType: "Company",

        receiverId: investor._id,
        receiverType: "Investor",

        amount: mongoose.Types.Decimal128.fromString(amount.toString()),
        netAmount: mongoose.Types.Decimal128.fromString(amount.toString()),
        fee: 0,

        currency,

        paymentDetails: {
          method: "WALLET",
        },

        description: "Distribution payout",
      });

      payouts.push({
        investorId: investor._id,
        ownershipPercentage: o.ownershipPercentage,
        amount: mongoose.Types.Decimal128.fromString(amount.toString()),
        status: "PAID",
        transactionId: transaction._id,
        paidAt: new Date(),
      });
    }

    // 6) Create distribution
    const distribution = await Distribution.create({
      distributionNumber: "DIST-" + Date.now(),
      companyId,
      type,

      totalAmount: mongoose.Types.Decimal128.fromString(totalAmount.toString()),
      profitAmount: mongoose.Types.Decimal128.fromString(totalAmount.toString()),
      distributionRate: 1,

      currency,

      payouts,
    });

    return res.status(201).json({
      message: "Distribution executed instantly",
      distribution,
      companyBalance: newCompanyBalance,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const getMyCompanyDistributions = async (req, res) => {
  try {
    const company = await Company.findOne({ ownerId: req.userId });

    if (!company) {
      return res.status(404).json({ message: "Company not found for this user" });
    }

    const distributions = await Distribution.find({ companyId: company._id })
      .populate("companyId", "name")
      .populate({
        path: "payouts.investorId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .populate("payouts.transactionId", "transactionNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Distributions fetched successfully",
      distributions,
    });
  } catch (error) {
    console.error("ERROR IN FETCHING COMPANY DISTRIBUTIONS", error);
    res.status(500).json({ message: error.message });
  }
};


export {
  getAllDistributions,
  postDistribution,
  getDistribution,
  putDistribution,
  deleteDistribution,
  getMyCompanyDistributions
};
