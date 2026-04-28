import Investor from "../models/Investor.js";
import AuditLogs from "../models/audit_Logs.js";

export const getAllInvestors = async (req, res) => {
  try {
    const investors = await Investor.find({})
  .populate("userId", "email");
  return res.status(200).json(investors);
  } catch (error) {
    console.error("Error fetching investors:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInvestorById = async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id)
    .populate("userId", "email")

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
    const kycLevel =
      req.body.investorType === "INDIVIDUAL"
      ? "BASIC"
      : req.body.investorType === "COMPANY"
      ? "STANDARD"
      : undefined; 

    const investor = await Investor.create({
      ...req.body,
      userId: req.userId,
      company: req.body.investorType === "COMPANY" ? req.body.company : undefined,
       kyc: {
          ...req.body.kyc,
          level: kycLevel,
       },
       
      isOnboarded: true,
    });

    return res.status(201).json({
      message: "Onboarding completed",
      investor,
    });
  } catch (err) {
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
export const reviewKyc = async(req,res)=>{
  try{
    const investorId= req.params.id;
    const {decision,notes,rejectionReason}=req.body;

    //check if investor exists
    const investor= await Investor.findById(investorId);
    if(!investor){
      return res.status(404).json({message:"Investor not found"});
    }
     if (!investor.kyc) {
      investor.kyc = {}; 
    }
    const before = investor.toObject() ;
    //check status
    const allowedStatuses = ["IN_PROGRESS", "NOT_STARTED"];

if (!allowedStatuses.includes(investor.kyc?.status)) {
  return res.status(400).json({ message: "KYC has been reviewed" });
}
    const cleanDecision = decision?.toLowerCase().trim();
    if(cleanDecision==="approve"){
      investor.kyc.status="APPROVED";
      investor.kyc.verifiedAt=new Date();
      investor.kyc.expiresAt= new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000 
      );//1 year
    }
    else if (cleanDecision === "reject") {
      investor.kyc.status = "REJECTED";
      investor.kyc.rejectionReason = rejectionReason || "Not specified";
    }
    else {
      return res.status(400).json({ message: "Invalid decision" });
    }
       if (req.userId) {
      investor.kyc.reviewedBy = req.userId;
    }

    if (notes) investor.kyc.notes = notes;

    await investor.save();
     const after ={...investor.toObject()};
        await AuditLogs.create({
          action:cleanDecision === "approve" ? "INVESTOR_APPROVED" :"INVESTOR_REJECTED",
          entityType:"INVESTOR",
          entityId:investor._id,
          userId:req.userId,
          userType:"ADMIN",
          changes:{
            before,
            after
          },
          metadata:{
            ipAddress:req.ip,
            userAgent:req.header["user-agent"]
          }
        });

    return res.json({
      message: `KYC ${cleanDecision}d successfully`,
      kyc: investor.kyc,
    });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}