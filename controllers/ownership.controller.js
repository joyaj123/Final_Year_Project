import Ownership from "../models/Ownership.js";
import Investor from "../models/Investor.js";
import { authMiddleware } from "../middlewar/authMiddlewar.js";

//GET OWNERSHIPS
export const getOwnerships=async(req,res)=>{
    try{
        const ownerships=await Ownership.find({});
        res.status(200).json(ownerships);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
//GET ONE OWNERSHIP
export const getOwnership=async(req,res)=>{
    try{
        const{id}=req.params;
        const ownership=await Ownership.findById(id);
        res.status(200).json(ownership);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
//CREATE OWNERSHIP
export const postOwnership=async(req,res)=>{
    try{
        const ownership=await Ownership.create(req.body);
        res.status(200).json(ownership);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
//UPDATE AN OWNERSHIP
export const updateOwnership=async(req,res)=>{
try{
    const ownership=await Ownership.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new:true,runValidators:true}
);
if(!ownership){
    return res.status(404).json({message:"ownership not found"});
}
res.status(200).json(ownership);
}catch(error){
    console.error("ERROR UPDATING OWNERSHIP:",error);
    res.status(400).json({message:error.message});
}
};
//DELETE AN OWNERSHIP
export const deleteOwnership=async(req,res)=>{
    try{
        const ownership= await Ownership.findByIdAndDelete(req.params.id);
        if(!ownership){
            return res.status(404).json({message:"Ownership not found"});
        }
        res.status(200).json({message:"Ownership deleted successfuly"});
    }catch(error){
        console.error("ERROR DELETING OWNERSHIP: ",error);
        res.status(500).json({message:error.message});
    }
};
    //for portfolio
    export const getPortfolio=async(req,res)=>{
  try {
    const userId = req.userId;

    const investor = await Investor.findOne({ userId });

    if (!investor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    const ownerships = await Ownership.find({
      investorId: investor._id,
    }).populate("companyId", "name");

    const formatted = ownerships.map((o) => {
      const invested = Number(o.totalInvested?.toString() || 0);
      const current = Number(o.currentValue?.toString() || 0);
      const gain = Number(o.unrealizedGainLoss?.toString() || 0);

      return {
        id: o._id,
        name: o.companyId?.name || "Unknown",
        shares:Number(o.totalShares).toFixed(2),
        ownership: o.ownershipPercentage,

        invested,
        currentValue: current,

        gainAmount: gain,
        gainPercent:
          invested > 0 ? ((gain / invested) * 100).toFixed(2) : 0,

        multiple:
          invested > 0 ? (current / invested).toFixed(2) : 0,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("PORTFOLIO ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

