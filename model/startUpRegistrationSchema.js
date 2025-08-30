const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const StartUpSchema = new mongoose.Schema(
  {
    // Section 1: Startup & Team Details
    startupName: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: ["Idea", "Prototype", "Early Revenue", "Growth"],
      required: true,
    },
    description: { type: String, maxlength: 200, required: true },
    city: { type: String, required: true, trim: true },
    teamSize: { type: Number, required: true, min: 1 },
    pitchdeckPdf: { type: String, default: "" }, // /uploads/xxx.pdf

    // Section 2: Founder / Primary Contact
    founder: {
      fullName: { type: String, required: true, trim: true },
      designation: { type: String, required: true, trim: true }, // Founder/Co-founder/CEO
      email: { type: String, required: true, lowercase: true, trim: true },
      mobile: { type: String, required: true, trim: true },
      linkedin: { type: String, default: "" },
    },

    // Section 3: Additional Team Members
    teamMembers: { type: [TeamMemberSchema], default: [] },

    // Section 4: Investment & Funding Details
    fundingSoughtINR: { type: Number, required: true, min: 0 },
    equityOfferedPercent: { type: Number, required: true, min: 0, max: 100 },
    useOfFunds: { type: String, required: true, trim: true },
    raisedBefore: {
      hasRaised: { type: Boolean, required: true },
      details: { type: String, default: "" }, // amount + investors if yes
    },

    // Section 5: Event Registration & Payment
    baseCharge: { type: Number, required: true, min: 0 },
    perMemberCharge: { type: Number, required: true, min: 0 },
    totalPayable: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "Net Banking"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    // Section 6: Declaration
    declarationTruth: { type: Boolean, required: true },
    declarationRules: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StartUp", StartUpSchema);



// const mongoose = require("mongoose");

// const StartUpSchema = new mongoose.Schema(
//   {
//     fullname: { type: String, required: true, trim: true },
//     email: { type: String, required: true, lowercase: true, trim: true },
//     mobile: { type: String, required: true, trim: true },
//     organisation: { type: String, required: true },
//     amount: { type: Number, required: true },
//     paymentStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" },

//     // Step 2 fields
//     pitchText: { type: String, default: "" },
//     pitchPdf: { type: String, default: "" }, // uploaded file path
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("StartUp", StartUpSchema);
