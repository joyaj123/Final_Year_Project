import Company from "../models/Company.js";
import { randomInt } from "crypto";

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