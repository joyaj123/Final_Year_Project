import AuditLogs from "../models/audit_Logs.js";

//GET AUDIT_LOGS
export const getAudit_Logs=async(req,res)=>{
    try{
        const audit_Logs=await AuditLogs.find({});
        res.status(200).json(audit_Logs);
    }catch(error){
        res.status(200).json({message:error.message});
    }
};
//GET AUDIT_LOG
export const getAudit_Log=async(req,res)=>{
    try{
        const{id}=req.params;
        const audit_Log=await AuditLogs.findById(id);
        res.status(200).json(audit_Log);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
//CREATE AN AUDIT_LOG
export const postAudit_Log=async(req,res)=>{
    try{
        const audit_Log=await AuditLogs.create(req.body);
        res.status(200).json(audit_Log);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
//UPDATE AN AUDIT_LOG
export const updateAudit_Log=async (req, res) => {
  try {
    const audit_Log = await AuditLogs.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!audit_Log) {
      return res.status(404).json({ message: "audit_log not found" });
    }

    res.status(200).json(audit_Log);
  } catch (error) {
    console.error("ERROR UPDATING AUDIT_LOG:", error);
    res.status(400).json({ message: error.message });
  }
};
//DELETE AN AUDIT_LOG
  export const deleteAudit_Log =  async (req, res) => {
  try {
    const audit_Log = await AuditLogs.findByIdAndDelete(req.params.id);
    if (!audit_Log) {
      return res.status(404).json({ message: "audit_Log not found" });
    }
    res.status(200).json({ message: "audit_Log deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING AUDIT_LOG:", error);
    res.status(500).json({ message: error.message });
  }

};
