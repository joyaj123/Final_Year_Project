import FinancialHistory from "../models/FinancialHistory.js";

export const getAllFinancialHistories = async (req, res) => {
  try {
    const histories = await FinancialHistory.find({}).populate("business");
    res.status(200).json(histories);
  } catch (error) {
    console.error("ERROR FETCHING FINANCIAL HISTORIES:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createFinancialHistory = async (req, res) => {
  try {
    const history = await FinancialHistory.create(req.body);
    res.status(201).json(history);
  } catch (error) {
    console.error("ERROR CREATING FINANCIAL HISTORY:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getFinancialHistoryById = async (req, res) => {
  try {
    const history = await FinancialHistory.findById(req.params.id).populate(
      "business"
    );

    if (!history) {
      return res.status(404).json({ message: "FinancialHistory not found" });
    }

    res.status(200).json(history);
  } catch (error) {
    console.error("ERROR FETCHING FINANCIAL HISTORY:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateFinancialHistory = async (req, res) => {
  try {
    const history = await FinancialHistory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!history) {
      return res.status(404).json({ message: "FinancialHistory not found" });
    }

    res.status(200).json(history);
  } catch (error) {
    console.error("ERROR UPDATING FINANCIAL HISTORY:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteFinancialHistory = async (req, res) => {
  try {
    const history = await FinancialHistory.findByIdAndDelete(req.params.id);

    if (!history) {
      return res.status(404).json({ message: "FinancialHistory not found" });
    }

    res.status(200).json({ message: "FinancialHistory deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING FINANCIAL HISTORY:", error);
    res.status(500).json({ message: error.message });
  }
};