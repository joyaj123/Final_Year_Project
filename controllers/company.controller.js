import Company from "../models/Company.js";
import AuditLogs from "../models/audit_Logs.js";

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

export const listing = async (req, res) => {
  try {
    const { funding, ...rest } = req.body;

    const company = await Company.create({
      ...rest,
      ownerId: req.userId,
      status: "PENDING_REVIEW",
      funding: {
        ...funding,
        pricePerPercent: funding?.targetAmount / funding?.equityOffered,
        sharePrice: funding?.targetAmount / funding?.totalShares,
      },
      isListing: true,
    });

    return res.status(201).json({
      message: "Listing completed",
      company,
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
    if(company.status!=="PENDING_REVIEW"){
      return res.status(400).json({message: "Company has been reviewed"});
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
  await AuditLogs.save();

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