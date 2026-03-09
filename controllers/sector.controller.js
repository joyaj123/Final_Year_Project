import Sector from "../models/Sector.js";

export const getAllSectors = async (req, res) => {
  try {
    const sectors = await Sector.find({});
    res.status(200).json(sectors);
  } catch (error) {
    console.error("ERROR FETCHING SECTORS:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createSector = async (req, res) => {
  try {
    const sector = await Sector.create(req.body);
    res.status(201).json(sector);
  } catch (error) {
    console.error("ERROR CREATING SECTOR:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getSectorById = async (req, res) => {
  try {
    const sector = await Sector.findById(req.params.id);

    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }

    res.status(200).json(sector);
  } catch (error) {
    console.error("ERROR FETCHING SECTOR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSector = async (req, res) => {
  try {
    const sector = await Sector.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }

    res.status(200).json(sector);
  } catch (error) {
    console.error("ERROR UPDATING SECTOR:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteSector = async (req, res) => {
  try {
    const sector = await Sector.findByIdAndDelete(req.params.id);

    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }

    res.status(200).json({ message: "Sector deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING SECTOR:", error);
    res.status(500).json({ message: error.message });
  }
};