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