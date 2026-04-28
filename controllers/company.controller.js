import Company from "../models/Company.js";
import AuditLogs from "../models/audit_Logs.js";
import Investor from "../models/Investor.js"; // change name if your file is different
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";


//GET COMPANIES
export const getCompanies=async(req,res)=>{
    try{
        const companies=await Company.find({});
        res.status(200).json(companies);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
//GET A COMPANY
export const getCompany=async(req,res)=>{
    try{
        const{id}=req.params;
        const company=await Company.findById(id);
        res.status(200).json(company);
      }catch(error){
        res.status(500).json({message:error.message});
    }
};
//CREATE A COMPANY
export const postCompany=async(req,res)=>{
     try{
        const company=await Company.create(req.body);
        res.status(200).json(company);
    }catch(error){
        res.status(500).json({message:error.message});
    }

};
//UPDATE A COMPANY
export const updateCompany=async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("ERROR UPDATING COMPANY:", error);
    res.status(400).json({ message: error.message });
  }
};
//DELETE A COMPANY
  export const deleteCompany =  async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING COMPANY:", error);
    res.status(500).json({ message: error.message });
  }

};
const generateRegistrationNumber = async () => {
  let registrationNumber;
  let exists = true;

  while (exists) {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    registrationNumber = `REG-${year}-${timestamp}-${randomPart}`;

    exists = await Company.exists({ registrationNumber });
  }

  return registrationNumber;
};
export const listing = async (req, res) => {
  try {
    const { funding = {}, ...rest } = req.body;

    const generatedRegistrationNumber = await generateRegistrationNumber();

    const targetAmount = Number(funding.targetAmount);
    const equityOffered = Number(funding.equityOffered);
    const totalShares = Number(funding.totalShares);

    const company = await Company.create({
      ...rest,
      ownerId: req.userId,
      registrationNumber: generatedRegistrationNumber,
      status: "PENDING_REVIEW",
      funding: {
        ...funding,
        pricePerPercent:
          targetAmount && equityOffered
            ? targetAmount / equityOffered
            : undefined,
        sharePrice:
          targetAmount && totalShares
            ? targetAmount / totalShares
            : undefined,
      },
      isListing: true,
    });

    return res.status(201).json({
      message: "Listing completed",
      company,
    });
  } catch (err) {
    console.error("LISTING ERROR:", err);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
export const reviewCompany=async(req,res)=>{
  try{
    const companyId=req.params.id;
    const {decision,notes}=req.body;

    //we need to check if company exists
    const company= await Company.findById(companyId);

    if(!company){
      return res.status(404).json({message:"Company not found"});
    }
    const before = company.toObject() ;
    //check status
    const allowedStatuses = [
  "PENDING_REVIEW",
  "DRAFT",
  "FUNDED",
  "CLOSED"
];

if (!allowedStatuses.includes(company.status)) {
  return res.status(400).json({ message: "Company has been reviewed" });
}
    const cleanDecision = decision?.toLowerCase().trim();
    if(cleanDecision==="approve"){
      company.status="APPROVED";
      company.approvedAt=new Date();
      company.approvedBy=req.userId;
      company.isListing=true;
    }
    else if (cleanDecision === "reject") {
      company.status = "REJECTED";
      company.isListing = false;
    } 
    else{
      return res.status(400).json({ message: "Invalid decision" });
    }
    await company.save();

    const after = company.toObject();

await AuditLogs.create({
  action: cleanDecision === "approve"
    ? "COMPANY_APPROVED"
    : "COMPANY_REJECTED",

  entityType: "COMPANY",
  entityId: company._id,
  userId: req.userId|| null,

  userType: (req.user?.role || "ADMIN").trim().toUpperCase(),

  changes: {
    before,
    after:company.toObject()
  },

  metadata: {
    ipAddress: req.ip || "unknown",
    userAgent: req.headers["user-agent"] || "unknown"
  }
}); 
  

     res.json({message: `Company ${decision}d successfully`, company});
  }catch(error){
    console.error(" FULL ERROR:", error);
  console.error(" STACK:", error.stack);

  return res.status(500).json({
    message: error.message,
    error: error.stack
  });
}
}


export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ ownerId: req.userId });

    if (!company) {
      return res.status(404).json({
        message: "Company not found for this user",
      });
    }

    return res.status(200).json({
      company,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



export const getMyWallet = async (req, res) => {
  try {
    const userId = req.userId;

    const company = await Company.findOne({ ownerId: userId });
    const investor = await Investor.findOne({ userId });

    if (!company && !investor) {
      return res.status(404).json({
        message: "No wallet found for this user",
      });
    }

    const walletOwner = company || investor;
    const ownerType = company ? "Company" : "Investor";

    return res.status(200).json({
      message: "Wallet fetched successfully",
      ownerType,
      ownerId: walletOwner._id,
      wallet: walletOwner.wallet,
    });
  } catch (error) {
    console.error("ERROR FETCHING WALLET:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};



