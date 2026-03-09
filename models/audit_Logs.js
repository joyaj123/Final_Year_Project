import mongoose from "mongoose";

const auditLogsSchema=new mongoose.Schema({
    action:{
        type:String,
        required:true,
        index:true, },
    entityType:{
        type:String,
        required:true,
        index:true, },
    entityId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        index:true,},
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required:true,
        index:true,},
    userType:{
        type:String,
        enum:["INVESTOR","BUSINESS_OWNER", "ADMIN", "SUPER_ADMIN"],
        required:true,
        index:true,},
    timestamp:{
        type:Date,
        required:true,
        default:Date.now,
        index:true,},
    changes:{
        before:{
            type:mongoose.Schema.Types.Mixed,
        },
        after:{
            type:mongoose.Schema.Types.Mixed,
        },
    },
    metadata:{
        ipAddress:String,
        userAgent:String,
        sessionId:String,
    },
    
},
{timestamp:true}//it adds the createdAt and updatedAt
);

const AuditLogs = mongoose.model("AuditLogs", auditLogsSchema);

export default AuditLogs;