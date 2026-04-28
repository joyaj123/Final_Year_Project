import Deal from "../models/deals.js";
import Company from "../models/Company.js";
import Ownership from "../models/Ownership.js";
import Transaction from "../models/Transaction.js";
import Investor from "../models/Investor.js";
import mongoose from "mongoose";

// CREATE a deal
const postDeal = async (req, res) => {
  try {
    console.log("Creating deal with data:", req.body);
    const deal = await Deal.create(req.body);
    res.status(201).json(deal);
  } catch (error) {
    console.error("Error creating deal:", error);
    res.status(400).json({ message: error.message });
  }
};

// GET all deals (with populated references)
const getAllDeal = async (req, res) => {
  try {
    console.log("Fetching all deals...");
    
    const deals = await Deal.find()
      .populate("companyId", "name sectorId")
      .populate("companySnapshot.sectorId", "name")
      .populate("adminReview.reviewedBy", "name"); // populate admin who reviewed

    console.log(`Found ${deals.length} deals`);
    res.status(200).json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET deal by ID (with populated references)
const getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("companyId", "name sectorId")
      .populate("companySnapshot.sectorId", "name")
      .populate("adminReview.reviewedBy", "name"); // populate admin who reviewed

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json(deal);
  } catch (error) {
    console.error("Error fetching deal:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a deal
const putDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    const updatedDeal = await Deal.findById(deal._id)
      .populate("companyId", "name sectorId")
      .populate("companySnapshot.sectorId", "name")
      .populate("adminReview.reviewedBy", "name"); // populate admin who reviewed

    res.status(200).json(updatedDeal);
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE a deal
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (error) {
    console.error("Error deleting deal:", error);
    res.status(500).json({ message: error.message });
  }
};
 const updateDealStatus =async(req,res) =>{
  try{
    const dealId=req.params.id;
    const { decision, notes } = req.body;
    
    //we need to check if deal exists
    const deal= await Deal.findById(dealId);
    if(!deal){
      return res.status(404).json({message: "Deal not found"});
    }
    //check if the status is not draft and the admin status is not pending 
    if(deal.status!== "DRAFT" && deal.adminStatus!== "PENDING"){
      return res.status(400).json({message: "Deal has been reviewed"});
    }
    const cleanDecision = decision?.toLowerCase().trim();

    if (cleanDecision === "approve") {
      deal.adminStatus = "APPROVED";
      deal.status = "OPEN";
    } else if (cleanDecision === "reject") {
      deal.adminStatus = "REJECTED";
      deal.status = "CANCELLED";
    } else {
      return res.status(400).json({ message: "Invalid decision" });
    }
    deal.adminReview={
      reviewedBy:req.userId,
      reviewedAt: new Date(),
      action: deal.adminStatus,
      notes: notes || null,
    };
    await deal.save()
    res.json({message: `Deal ${decision}d successfully`, deal});

  }catch(error){
    res.status(500).json({message: error.message});
  }
 }
export const getActiveDeals = async (req,res) =>{
  try{
    const deals = await Deal.find({
      status : "OPEN",
      adminStatus : "APPROVED",
      "fundingProgress.remainingAmount": { $gt: 0 }

    }).select('title  description investmentTerms fundingProgress ') ;
    
    res.status(200).json({deals});
  }
  catch(error){
    res.status(500).json({message : error.message}) ; 
  }
}


export const getCompanyDeals = async (req, res) => {
  try {
    // 1. Get logged-in user ID from auth middleware
    const userId = req.user.id;

    // 2. Find company owned by this user
    const company = await Company.findOne({ ownerId: userId });

    if (!company) {
      return res.status(404).json({
        message: "Company not found for this user",
        
      });
    }

    // 3. Get all deals for this company
    const deals = await Deal.find({
      companyId: company._id,
       status : "OPEN",
      adminStatus : "APPROVED",
      "fundingProgress.remainingAmount": { $gt: 0 }
    })

    // 4. Return data
    res.status(200).json({ deals });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateDealNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DEAL-${Date.now()}-${random}`;
};

export const createDeal = async (req, res) => {
  try {
    const { investmentTerms, fundingProgress, ...rest } = req.body;

    const company = await Company.findOne({ ownerId: req.userId });

    if (!company) {
      return res.status(404).json({ message: "Company not found for this user" });
    }

    const deal = await Deal.create({
      ...rest,
      dealNumber: generateDealNumber(),
      companyId: company._id,

      investmentTerms: {
  ...investmentTerms,
  currency: investmentTerms?.currency || "USD",
  pricePerPercent: investmentTerms?.targetRaise / investmentTerms?.equityOfferedPct,
  totalSharesOffered: investmentTerms?.targetRaise / investmentTerms?.pricePerShare,
  valuation: investmentTerms?.targetRaise / (investmentTerms?.equityOfferedPct / 100)
},

      fundingProgress: {
        ...fundingProgress,
        remainingAmount: investmentTerms?.targetRaise,
      },
    });

    return res.status(201).json({
      message: "Deal created successfully",
      deal,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// 1. Get deal
export const getDealById = async (dealId) => {
  const deal = await Deal.findById(dealId);

  if (!deal) {
    throw new Error("Deal not found");
  }

  return deal;
};

// 2. Validate investment
export const validateInvestment = async ({ deal, amount }) => {
  if (deal.status !== "OPEN") {
    throw new Error("Deal is not open for investment");
  }

  if (deal.adminStatus !== "APPROVED") {
    throw new Error("Deal is not approved");
  }

  const minInvestment = Number(deal.investmentTerms?.minInvestment || 0);
  const maxInvestment = deal.investmentTerms?.maxInvestment
    ? Number(deal.investmentTerms.maxInvestment)
    : null;

  const remainingAmount = Number(deal.fundingProgress?.remainingAmount || 0);

  if (amount < minInvestment) {
    throw new Error(`Minimum investment is ${minInvestment}`);
  }

  if (maxInvestment !== null && amount > maxInvestment) {
    throw new Error(`Maximum investment is ${maxInvestment}`);
  }

  if (amount > remainingAmount) {
    throw new Error("Investment amount exceeds remaining amount");
  }
};

// 3. Calculate investment details
export const calculateInvestment = ({ deal, amount }) => {
  const pricePerShare = Number(deal.investmentTerms?.pricePerShare || 0);
  const targetRaise = Number(deal.investmentTerms?.targetRaise || 0);
  const equityOfferedPct = Number(deal.investmentTerms?.equityOfferedPct || 0);

  if (!pricePerShare || pricePerShare <= 0) {
    throw new Error("Invalid pricePerShare in deal");
  }

  if (!targetRaise || targetRaise <= 0) {
    throw new Error("Invalid targetRaise in deal");
  }

  const shares = amount / pricePerShare;
  const ownershipPercentage = (amount / targetRaise) * equityOfferedPct;

  return {
    amount,
    shares,
    ownershipPercentage,
  };
};

// 4. Create transaction
const generateTransactionNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRANSAC-${Date.now()}-${random}`;
};

export const createTransaction = async ({
  investorId,
  deal,
  amount,
  paymentDetails,
  session,
}) => {
  const [transaction] = await Transaction.create(
    [
      {
        transactionNumber: generateTransactionNumber(),
        type: "INVESTMENT",
        status: "COMPLETED",
        senderId: investorId,
        senderType: "INVESTOR",
        receiverId: null,
        receiverType: "PLATFORM",
        amount,
        currency: deal.investmentTerms.currency,
        netAmount: amount,
        dealId: deal._id,
        paymentDetails,
        description: "Investment transaction",
      },
    ],
    { session }
  );

  return transaction;
};

// 5. Create or update ownership
export const createOrUpdateOwnership = async ({
  investorId,
  deal,
  calculation,
  session,
}) => {
  let ownership = await Ownership.findOne({
    investorId,
    companyId: deal.companyId,
  }).session(session);

  const amount = Number(calculation.amount);
  const shares = Number(calculation.shares);

  if (!ownership) {
    ownership = new Ownership({
      investorId,
      companyId: deal.companyId,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
      totalShares: shares,
      ownershipPercentage: calculation.ownershipPercentage,
      totalInvested: amount,
      currentValue: amount,
      currency: deal.investmentTerms.currency,
      acquisitions: [
        {
          dealId: deal._id,
          shares,
          amount,
          acquiredAt: new Date(),
          type: "PRIMARY",
        },
      ],
    });

    await ownership.save({ session });
  } else {
    const oldTotalInvested = Number(ownership.totalInvested);
    const oldTotalShares = Number(ownership.totalShares);

    const newTotalInvested = oldTotalInvested + amount;
    const newTotalShares = oldTotalShares + shares;

    ownership.totalInvested = newTotalInvested;
    ownership.totalShares = newTotalShares;
    ownership.ownershipPercentage += calculation.ownershipPercentage;
    ownership.currentValue = newTotalInvested;
    ownership.unrealizedGainLoss = 0;
    ownership.updatedAt = new Date();

    ownership.acquisitions.push({
      dealId: deal._id,
      shares,
      amount,
      acquiredAt: new Date(),
      type: "PRIMARY",
    });

    await ownership.save({ session });
  }

  return ownership;
};

// 6. Update deal funding
export const updateDealFunding = async ({ deal, amount, session }) => {
  const currentAmountRaised = Number(deal.fundingProgress?.amountRaised || 0);
  const currentInvestorCount = Number(deal.fundingProgress?.investorCount || 0);
  const targetRaise = Number(deal.investmentTerms?.targetRaise || 0);

  const newAmountRaised = currentAmountRaised + amount;
  const newRemainingAmount = targetRaise - newAmountRaised;
  const newPercentageRaised = (newAmountRaised / targetRaise) * 100;

  deal.fundingProgress.amountRaised = newAmountRaised;
  deal.fundingProgress.remainingAmount = newRemainingAmount;
  deal.fundingProgress.percentageRaised = newPercentageRaised;
  deal.fundingProgress.investorCount = currentInvestorCount + 1;

  if (newAmountRaised >= targetRaise) {
    deal.status = "FUNDED";
    deal.closedAt = new Date();

    await releaseFundsToCompany({ deal, session }); ////////// ADD THIS

  }

  
  await deal.save({ session });
  return deal;
};

const releaseFundsToCompany = async ({ deal, session }) => {
  const company = await Company.findById(deal.companyId).session(session);

  if (!company) {
    throw new Error("Company not found");
  }

  const amount = Number(deal.fundingProgress.amountRaised || 0);

  const currentBalance = Number(company.wallet?.balance?.toString() || 0);
  const newBalance = currentBalance + amount;

  company.wallet.balance = mongoose.Types.Decimal128.fromString(newBalance.toString());
  company.markModified("wallet");

  await company.save({ session });

  // CREATE ONE TRANSACTION (IMPORTANT)
  await Transaction.create(
  [
    {
      transactionNumber: "TXN-" + Date.now(),
      type: "FUNDING_RELEASE",
      status: "COMPLETED",

      senderId: null,
      senderType: "PLATFORM",

      receiverId: company._id,
      receiverType: "COMPANY",

      amount: mongoose.Types.Decimal128.fromString(amount.toString()),
      netAmount: mongoose.Types.Decimal128.fromString(amount.toString()),
      fee: 0,
      currency: deal.investmentTerms.currency,

      paymentDetails: {
        method: "WALLET", // ✅ ADD THIS
      },

      description: "Deal funding released to company",
      dealId: deal._id,
    },
  ],
  { session }
);
};

// Main function
export const executeInvestment = async ({
  investorId,
  dealId,
  amount,
  paymentDetails,
}) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const deal = await Deal.findById(dealId).session(session);

      if (!deal) {
        throw new Error("Deal not found");
      }

      await validateInvestment({ deal, amount });

      const calculation = calculateInvestment({ deal, amount });

      const transaction = await createTransaction({
        investorId,
        deal,
        amount,
        paymentDetails,
        session,
      });

      const ownership = await createOrUpdateOwnership({
        investorId,
        deal,
        calculation,
        session,
      });

      await updateDealFunding({
        deal,
        amount,
        session,
      });

      result = {
        message: "Investment successful",
        ownership,
        transaction,
        calculation,
      };
    });

    return result;
  } catch (err) {
    throw err;
  } finally {
    await session.endSession();
  }
};

export const investInDeal = async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.userId });

    if (!investor) {
      return res.status(404).json({
        message: "Investor not found",
      });
    }

    const result = await executeInvestment({
      investorId: investor._id,
      dealId: req.body.dealId,
      amount: Number(req.body.amount),
      paymentDetails: req.body.paymentDetails,
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal,
  updateDealStatus
};