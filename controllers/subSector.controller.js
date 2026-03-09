import SubSector from "../models/SubSector.js";

export const getAllSubSectors = async (req, res) => {
  try {
    const subsectors = await SubSector.find({}).populate("sector");
    res.status(200).json(subsectors);
  } catch (error) {
    console.error("ERROR FETCHING SUBSECTORS:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createSubSector = async (req, res) => {
  try {
    const subsector = await SubSector.create(req.body);
    res.status(201).json(subsector);
  } catch (error) {
    console.error("ERROR CREATING SUBSECTOR:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getSubSectorById = async (req, res) => {
  try {
    const subsector = await SubSector.findById(req.params.id).populate("sector");

    if (!subsector) {
      return res.status(404).json({ message: "SubSector not found" });
    }

    res.status(200).json(subsector);
  } catch (error) {
    console.error("ERROR FETCHING SUBSECTOR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSubSector = async (req, res) => {
  try {
    const subsector = await SubSector.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subsector) {
      return res.status(404).json({ message: "SubSector not found" });
    }

    res.status(200).json(subsector);
  } catch (error) {
    console.error("ERROR UPDATING SUBSECTOR:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteSubSector = async (req, res) => {
  try {
    const subsector = await SubSector.findByIdAndDelete(req.params.id);

    if (!subsector) {
      return res.status(404).json({ message: "SubSector not found" });
    }

    res.status(200).json({ message: "SubSector deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING SUBSECTOR:", error);
    res.status(500).json({ message: error.message });
  }
};