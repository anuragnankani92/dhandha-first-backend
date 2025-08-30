const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema(
  {
    baseCharge: { type: Number, required: true, min: 0 },       // e.g., 2000
    perMemberCharge: { type: Number, required: true, min: 0 },  // e.g., 750
  },
  { timestamps: true }
);
const Pricing = mongoose.model("Pricing", PricingSchema);

module.exports = Pricing;