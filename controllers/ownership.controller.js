import Ownership from "../models/Ownership.js";

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

