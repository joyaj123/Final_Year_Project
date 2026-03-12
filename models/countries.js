import mongoose from "mongoose";


const countrySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // ISO alpha-2
  },

  name: {
    type: String,
    required: true,
  },

  region: String,

  currencyCode: String,

  isSupported: {
    type: Boolean,
    default: true,
    index: true,
  },

  kycRequired: {
    type: Boolean,
    required: true,
  },
});

const Country = mongoose.models.countries || mongoose.model("countries", countrySchema);

export default Country;  // 👈 This is crucial for ES modules