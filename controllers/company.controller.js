import Company from "../models/Company.js";

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
    const {
      name,
      slug,
      registrationNumber,
      listingType,
      details,
      classification,
      funding,
      financials,
      valuation,
      team,
      documents,
      metrics
    } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!slug) return res.status(400).json({ message: "Slug is required" });
    if (!listingType) return res.status(400).json({ message: "Listing type is required" });

    if (!details?.description) return res.status(400).json({ message: "Description is required" });
    if (!details?.shortDescription) return res.status(400).json({ message: "Short description is required" });
    if (!details?.foundedDate) return res.status(400).json({ message: "Founded date is required" });
    if (!details?.businessModel) return res.status(400).json({ message: "Business model is required" });
    if (!details?.website) return res.status(400).json({ message: "Website is required" });

    if (!classification?.sectorId) return res.status(400).json({ message: "SectorId is required" });
    const sector = await Sector.findById(classification.sectorId);
    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });}
    if (!classification?.businessType) return res.status(400).json({ message: "Business type is required" });

    if (!funding?.targetAmount) return res.status(400).json({ message: "Target amount is required" });
    if (!funding?.minimumInvestment) return res.status(400).json({ message: "Minimum investment is required" });
    if (!funding?.currency) return res.status(400).json({ message: "Currency is required" });
    if (!funding?.equityOffered) return res.status(400).json({ message: "Equity offered is required" });
    if (!funding?.pricePerPercent) return res.status(400).json({ message: "Price per percent is required" });
    if (!funding?.fundingDeadline) return res.status(400).json({ message: "Funding deadline is required" });
    if (!funding?.fundingStartDate) return res.status(400).json({ message: "Funding start date is required" });
    if (!financials?.arr) return res.status(400).json({ message: "ARR is required" });
    if (!financials?.grossRevenue) return res.status(400).json({ message: "Gross revenue is required" });
    if (!financials?.netIncome) return res.status(400).json({ message: "Net income is required" });
    if (!financials?.asOfDate) return res.status(400).json({ message: "As of date is required" });
    if (!financials?.currency) return res.status(400).json({ message: "Financial currency is required" });
    if (financials?.audited === undefined) return res.status(400).json({ message: "Audited flag is required" });

    if (!valuation?.preMoneyValuation) return res.status(400).json({ message: "Pre money valuation is required" });
    if (!valuation?.postMoneyValuation) return res.status(400).json({ message: "Post money valuation is required" });
    if (!valuation?.valuationMethod) return res.status(400).json({ message: "Valuation method is required" });
    if (!valuation?.valuedAt) return res.status(400).json({ message: "Valuation date is required" });

    if (!Array.isArray(team) || team.length === 0)
      return res.status(400).json({ message: "Team is required" });

    for (const member of team) {
      if (!member.name || !member.role) {
        return res.status(400).json({
          message: "Each team member must have name and role"
        });
      }
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        message: "At least one document is required",
      });
    }

    for (const doc of documents) {
      if (
        !doc.type ||
        !doc.name ||
        !doc.fileUrl ||
        !doc.uploadedAt ||
        !doc.visibility
      ) {
        return res.status(400).json({
          message:
            "Each document must include type, name, fileUrl, uploadedAt, and visibility",
        });
      }
    }

    if (!metrics?.employeeCount)
      return res.status(400).json({ message: "Employee count is required" });

    const existingCompany = await Investor.findOne({ ownerId: req.userId });
    if (existingCompany && existingCompany.isListing) {
      return res.status(400).json({
        message: "Listing already completed",
      });
    }

    const company = await Company.findOneAndUpdate({
        ownerId: req.userId,
        name,
        slug,
        registrationNumber,
        listingType,
        details,
        classification,
        funding,
        financials,
        valuation,
        team,
        documents,
        metrics,
        isListing : true
      },
    );
    res.status(201).json({
      message: "Listing completed",
      company,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};