import mongoose from "mongoose";

const subSectorSchema = new mongoose.Schema(
  {
    sectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sector",
      required: true,
      index: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const SubSector = mongoose.models.SubSector || mongoose.model("SubSector", subSectorSchema);
export default SubSector;

