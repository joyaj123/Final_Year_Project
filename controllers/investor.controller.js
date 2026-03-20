import Investor from "../models/Investor.js";

export const getAllInvestors = async (req, res) => {
  try {
    const investors = await Investor.find({});
    res.status(200).json(investors);
  } catch (error) {
    console.error("Error fetching investors:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInvestorById = async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    res.status(200).json(investor);
  } catch (error) {
    console.error("Error fetching investor:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createInvestor = async (req, res) => {
  try {
    const investor = await Investor.create(req.body);
    res.status(201).json(investor);
  } catch (error) {
    console.error("Error creating investor:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateInvestor = async (req, res) => {
  try {
    const investor = await Investor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!investor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    res.status(200).json(investor);
  } catch (error) {
    console.error("Error updating investor:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteInvestor = async (req, res) => {
  try {
    const investor = await Investor.findByIdAndDelete(req.params.id);

    if (!investor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    res.status(200).json({ message: "Investor deleted successfully" });
  } catch (error) {
    console.error("Error deleting investor:", error);
    res.status(500).json({ message: error.message });
  }
};

export const onboarding = async (req, res) => {
  try {
    const {
      investorType,
      riskTolerance,
      investmentSweetSpot,
      sourceOfFunds,
      company,
      documents,
      bankAccounts,
    } = req.body;

    if (!investorType) return res.status(400).json({ message: "investorType is required" });

    if (!sourceOfFunds.primary) {
      return res.status(400).json({
        message: "Primany sourceOfFunds is required",
      });
    }

    if (investorType === "COMPANY") {
      if (!company?.name)
      return res.status(400).json({ message: "Company name is required" });

     if (!company?.registrationNumber)
      return res.status(400).json({ message: "Registration Number is required" });
    
     if (!company?.incorporationDate)
      return res.status(400).json({ message: "Incorporation Date is required" });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        message: "At least one KYC document is required",
      });
    }

    for (const doc of documents) {
      if (
        !doc.type ||
        !doc.fileUrl ||
        !doc.uploadedAt ||
        !doc.verificationStatus
      ) {
        return res.status(400).json({
          message:
            "Each document must include type, fileUrl, uploadedAt, and verificationStatus",
        });
      }
    }
     if (!bankAccounts?.bankName) return res.status(400).json({ message: "BankName is required" });
     if (!bankAccounts?.accountNumber) return res.status(400).json({ message: "AccountNumber is required" });
     if (!bankAccounts?.isPrimary) return res.status(400).json({ message: "Primary account is required" });

    const existingInvestor = await Investor.findOne({ userId: req.userId });
    if (existingInvestor && existingInvestor.isOnboarded) {
      return res.status(400).json({
        message: "Onboarding already completed",
      });
    }

    const investor = await Investor.create({
        userId: req.userId,
        investorType,
        accreditationStatus : "PENDING",
        riskTolerance,
        investmentSweetSpot,
        sourceOfFunds,
        company: investorType === "COMPANY" ? company : undefined,
        kyc: {
          status: "IN_PROGRESS",
          documents,
        },
        wallet: {
            balance: 0,
            currency: "USD",
            lockedBalance: 0,
            totalInvested: 0,
            totalReturns: 0
        },
        bankAccounts,
        isOnboarded: true,
      },
    );

    res.status(201).json({
      message: "Onboarding completed",
      investor,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};