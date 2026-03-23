import Deal from "../models/deals.js";

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


export {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal,
};