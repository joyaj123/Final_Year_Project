import Deal from "../models/deals.js";
import Company from "../models/Company.js";
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

const generateDealNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DEAL-${Date.now()}-${random}`;
};

export const createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      investmentTerms,
      fundingProgress,
      companySnapshot,
      timeline
    } = req.body;

    const company = await Company.findOne({ ownerId: req.userId });
    if (!company) {
      return res.status(404).json({ message: "Company not found for this user" });
    }
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!investmentTerms?.targetRaise) {
      return res.status(400).json({ message: "Target raise is required" });
    }
    if (!investmentTerms?.currency) {
      return res.status(400).json({ message: "Currency is required" });
    }
    if (!investmentTerms?.minInvestment) {
      return res.status(400).json({ message: "Minimum investment is required" });
    }
    if (investmentTerms?.equityOfferedPct === undefined) {
      return res.status(400).json({ message: "Equity offered percentage is required" });
    }
    if (!investmentTerms?.pricePerPercent) {
      return res.status(400).json({ message: "Price per percent is required" });
    }
    if (!investmentTerms?.valuation) {
      return res.status(400).json({ message: "Valuation is required" });
    }
    if (fundingProgress?.amountRaised === undefined || fundingProgress?.amountRaised === null) {
      return res.status(400).json({ message: "Amount raised is required" });
    }
    if (fundingProgress?.percentageRaised === undefined || fundingProgress?.percentageRaised === null) {
        return res.status(400).json({ message: "Percentage raised is required" });
    }
    if (fundingProgress?.investorCount === undefined || fundingProgress?.investorCount === null) {
      return res.status(400).json({ message: "Investor count is required" });
    }
    if (fundingProgress?.remainingAmount === undefined || fundingProgress?.remainingAmount === null) {
     return res.status(400).json({ message: "Remaining amount is required" });
    }

    const deal = await Deal.create({
      dealNumber: generateDealNumber(),
      companyId: company._id,
      title,
      description,
      status:"PENDING_REVIEW",
      adminStatus:"PENDING",
      investmentTerms: {
        targetRaise: investmentTerms.targetRaise,
        currency: investmentTerms.currency,
        minInvestment: investmentTerms.minInvestment,
        maxInvestment: investmentTerms?.maxInvestment ?? null,
        equityOfferedPct: investmentTerms.equityOfferedPct,
        pricePerPercent: investmentTerms.pricePerPercent,
        pricePerShare: investmentTerms?.pricePerShare ?? null,
        totalSharesOffered: investmentTerms?.totalSharesOffered ?? null,
        valuation: investmentTerms.valuation,
        valuationMethod: investmentTerms?.valuationMethod ?? null,
      },
      fundingProgress: {
        amountRaised: fundingProgress?.amountRaised,
        percentageRaised: fundingProgress?.percentageRaised,
        investorCount: fundingProgress?.investorCount,
        remainingAmount: fundingProgress.remainingAmount,
      },
      companySnapshot: {
        name: companySnapshot?.name ?? null,
        sectorId: companySnapshot?.sectorId ?? null,
        subsectorId: companySnapshot?.subsectorId ?? null,
        country: companySnapshot?.country ?? null,
        valuation: companySnapshot?.valuation ?? null,
        arr: companySnapshot?.arr ?? null,
        ebitda: companySnapshot?.ebitda ?? null,
        revenue: companySnapshot?.revenue ?? null,
      },
      timeline: {
        openDate: timeline?.openDate ?? null,
        closeDate: timeline?.closeDate ?? null,
        fundingDeadline: timeline?.fundingDeadline ?? null,
      }
    });

    return res.status(201).json({
      message: "Deal created successfully",
      deal,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal,
};