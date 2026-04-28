import mongoose from "mongoose";

const InvestmentSweetSpotSchema = new mongoose.Schema( //addeh fi yedfa3 2a2ala chi w aktr chi 
  {
    min: { type: Number},
    max: { type: Number},
    currency: { type: String},
  },
  { _id: false }
);

const KYCDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["PASSPORT", "NATIONAL_ID", "DRIVERS_LICENSE", "PROOF_OF_ADDRESS", "SELFIE"],
    },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
    verificationStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
    },
    expiryDate: { type: Date, required: false },
  },
  { _id: false }
);

const KYCSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["NOT_STARTED", "IN_PROGRESS", "APPROVED", "REJECTED"],
      default: "IN_PROGRESS"
    },
    level: {
      type: String,
      required: true,
      enum: ["BASIC", "STANDARD", "ENHANCED"],
      default: "BASIC",
    },
    verifiedAt: { type: Date, required: false },
    expiresAt: { type: Date, required: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
    rejectionReason: { type: String, required: false },
    documents: {
      type: [KYCDocumentSchema],
      required: true, 
      default: [],//Définit une valeur automatique si rien n’est fourni
    },
  },
  { _id: false }
);

const SourceOfFundsSchema = new mongoose.Schema(
  {
    primary: {
      type: String,
      required: true,
      enum: ["EMPLOYMENT", "BUSINESS", "INHERITANCE", "INVESTMENT"],
    },
    description: { type: String, required: false },
    annualIncome: { type: Number, required: false },
    netWorth: { type: Number, required: false },
    verifiedAt: { type: Date, required: false },
  },
  { _id: false }
);

const CompanySchema = new mongoose.Schema(//conditional
  {
    name: { type: String, required: false },
    registrationNumber: { type: String, required: false },
    incorporationDate: { type: Date, required: false },
    incorporationCountry: { type: String, required: false },
    legalDocumentUrl: { type: String, required: false },
  },
  { _id: false }
);

const WalletSchema = new mongoose.Schema(
  {
    balance: { type: mongoose.Schema.Types.Decimal128, required: true, default: 0 },
    currency: { type: String, required: true, default: "USD" }, // ISO 4217
    lockedBalance: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    totalInvested: { type: mongoose.Schema.Types.Decimal128, required: true, default: 0 }, // Calculated
    totalReturns: { type: mongoose.Schema.Types.Decimal128, required: true, default: 0 }, // Calculated
  },
  { _id: false }
);

const BankAccountSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    routingNumber: { type: String, required: false },
    iban: { type: String, required: false },
    swift: { type: String, required: false },
    isPrimary: { type: Boolean, required: true, default: false },
    verifiedAt: { type: Date, required: false },
  },
  { _id: false }
);


const investorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    investorType: {
      type: String,
      required: true,
      enum: ["INDIVIDUAL", "COMPANY", "INSTITUTIONAL"],
      index: true,
    },

    isOnboarded: {
      type: Boolean,
      default: false,
    },

    accreditationStatus: { 
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "EXPIRED"],
      index: true,
      default: "PENDING"
    },

    riskTolerance: {
      type: String,
      required: false,
      enum: ["LOW", "MEDIUM", "HIGH", "AGGRESSIVE"],
    },

    investmentSweetSpot: { type: InvestmentSweetSpotSchema, required: false },

    kyc: { type: KYCSchema, required: true, default: () => ({}) },

    sourceOfFunds: { type: SourceOfFundsSchema, required: false },

    company: {
        type: CompanySchema,
        required: function () {
        return this.investorType === "COMPANY";
      },
    },

    wallet: { type: WalletSchema, required: true, default: () => ({}) },

    bankAccounts: { type: [BankAccountSchema], required: false, default: [] },

    preferredSectors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Sectors",
      required: false,
      default: [],
    },
    excludedSectors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Sectors",
      required: false,
      default: [],
    },
    preferredBusinessTypes: {
      type: [String],
      required: false,
      enum: ["E_COMMERCE", "SAAS", "CONTENT", "MARKETPLACE"],
      default: []
    },
  },
  { timestamps: true }
);

investorSchema.pre('save',async function(){
  try{

    if(this.preferredSectors){
      const preferredSectors = await mongoose.model('Sectors').findById(this.preferredSectors);
      if (!preferredSectors) throw new Error(`Sector ${this.preferredSectors} not found`);
    }
    if (this.excludedSectors) {
      const excludedSectors = await mongoose.model('Sectors').findById(this.excludedSectors);
      if (!excludedSectors) throw new Error(`Sector ${this.excludedSectors} not found`);
    }
    } catch (error) {
       console.log(error.message) ; 
    }
});

investorSchema.pre("save", function () {
  if (this.investorType === "INDIVIDUAL") {
    this.company = undefined;
  }
});

const Investor = mongoose.models.Investor ||mongoose.model("Investor", investorSchema);
export default Investor;