import User from "../models/Users.js";
import Deal from "../models/deals.js";
import Investor from "../models/Investor.js";
import Company from "../models/Company.js";

export const getDashboardStats =async(req,res)=>{
    try{
        const totalUsers= await User.countDocuments();
        const activeDeals = await Deal.countDocuments({
            status:"OPEN",
        });
        const pendingKyc= await Investor.countDocuments(
            {kycStatus:"IN_PROGRESS"},
        );
        const pendingCompanies= await Company.countDocuments({
            status:"PENDING_REVIEW"},
        );

        res.json({
            totalUsers,
            activeDeals,
            pendingKyc,
            pendingCompanies,
        });
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Server Error"});
    }
};