import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true},
type: {
   type: String,
   enum: ["DEAL_CONFIRMED","DISTRIBUTION","KYC_UPDATE","NEW_DEAL","PAYMENT_RECEIVED"],
   required: true,
   index: true

},
title: {
    type: String,
    required: true,
    trim: true

},
message: {
  type: String,
  required: true
},
isRead: {
  type: Boolean,
  required: true,
  default: false,
  index: true
},
readAt: {
  type: Date
},
expiresAt: {
   type: Date,
  index: { expires: 0 }
},
actionUrl: {
   type: String
},
relatedEntity: {
 type: { type: String},
 id: {type: mongoose.Schema.Types.ObjectId}

},
channels: {
  email: {type: Boolean,
         required: true,
         default: false},
   push: {type: Boolean,
         required: true,
         default: false},
   sms: {type: Boolean,
         required: true,
        default: false}
}

},
{timestamps: { createdAt: true, updatedAt: false }}
);

notificationSchema.pre("save", function (next) {
if (this.isModified("isRead") && this.isRead === true && !this.readAt) {
this.readAt = new Date();}
if (this.isModified("isRead") && this.isRead === false) {
this.readAt = null;
}
next();
}
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;