import Company from "../models/company.js";
import Investor from "../models/investor.js";

export const checkApproved = async (req, res, next) => {
  try {
    // 1. Try company
    const company = await Company.findOne({ ownerId: req.userId });

    if (company) {
      if (company.status?.trim().toUpperCase() !== "APPROVED") {
        return res.status(403).json({
          message: "Company must be approved",
        });
      }

      req.company = company;
      return next();
    }

    // 2. Try investor
    const investor = await Investor.findOne({ userId: req.userId });

    if (investor) {
      if (investor.kyc?.status !== "APPROVED") {
        return res.status(403).json({
          message: "Investor KYC must be approved",
        });
      }

      req.investor = investor;
      return next();
    }

    // 3. No profile found
    return res.status(404).json({
      message: "No company or investor profile found",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error checking approval",
    });
  }
};