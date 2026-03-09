import Notification from "../models/notification.js";

//GET NOTIFICATIONS
export const getNotifications=async(req,res)=>{
    try{
        const notifications=await Notification.find({});
        res.status(200).json(notifications);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
//GET NOTIFICATION
export const getNotification=async(req,res)=>{
    try{
        const{id}=req.params;
        const notification=await Notification.findById(id);
        res.status(200).json(notification);
      }catch(error){
        res.status(500).json({message:error.message});
    }
};
//CREATE NOTIFICATION
export const postNotification=async(req,res)=>{
     try{
        const notification=await Notification.create(req.body);
        res.status(200).json(notification);
    }catch(error){
        res.status(500).json({message:error.message});
    }

};
//UPDATE NOTIFICATION
export const updateNotification=async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("ERROR UPDATING NOTIFICATION:", error);
    res.status(400).json({ message: error.message });
  }
};
//DELETE NOTIFICATION
  export const deleteNotification =  async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("ERROR DELETING NOTIFICATION:", error);
    res.status(500).json({ message: error.message });
  }

};