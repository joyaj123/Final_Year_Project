import mongoose from "mongoose";

const sectorSchema = new mongoose.Schema(
  {
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

    iconUrl: {
      type: String
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true
    },

    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Sector = mongoose.models.Sector || mongoose.model("Sector", sectorSchema);
export default Sector;