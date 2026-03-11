import Distribution from "../models/Distributions.js";

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

export {
  getAllDistributions,
  postDistribution,
  getDistribution,
  putDistribution,
  deleteDistribution
};