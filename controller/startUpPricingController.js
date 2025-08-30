const Pricing = require('../model/startUpPricingSchema')



exports.setPricing = async (req, res) => {
  try {
    const { baseCharge, perMemberCharge } = req.body;

    // Ensure only one pricing config exists → update or create
    let pricing = await Pricing.findOne();
    if (pricing) {
      pricing.baseCharge = baseCharge;
      pricing.perMemberCharge = perMemberCharge;
      await pricing.save();
    } else {
      pricing = await Pricing.create({ baseCharge, perMemberCharge });
    }

    res.status(200).json({
      success: true,
      message: "Pricing updated successfully",
      data: pricing,
    });
  } catch (err) {
    console.error("❌ Pricing update failed:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Pricing (public use)
exports.getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.findOne();
    if (!pricing) {
      return res.status(404).json({ success: false, message: "Pricing not set" });
    }
    res.status(200).json({ success: true, data: pricing });
  } catch (err) {
    console.error("❌ Fetch pricing failed:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Create Pricing (only if not exists)
exports.createPricing = async (req, res) => {
  try {
    const { baseCharge, perMemberCharge } = req.body;

    // Prevent duplicate entry
    const existing = await Pricing.findOne();
    if (existing) {
      return res.status(400).json({ success: false, message: "Pricing already exists. Use update instead." });
    }

    const pricing = await Pricing.create({ baseCharge, perMemberCharge });

    res.status(201).json({
      success: true,
      message: "Pricing created successfully",
      data: pricing,
    });
  } catch (err) {
    console.error("❌ Create pricing failed:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Pricing
exports.updatePricing = async (req, res) => {
  try {
    const { baseCharge, perMemberCharge } = req.body;

    const pricing = await Pricing.findOne();
    if (!pricing) {
      return res.status(404).json({ success: false, message: "No pricing found to update" });
    }

    pricing.baseCharge = baseCharge ?? pricing.baseCharge;
    pricing.perMemberCharge = perMemberCharge ?? pricing.perMemberCharge;
    await pricing.save();

    res.status(200).json({
      success: true,
      message: "Pricing updated successfully",
      data: pricing,
    });
  } catch (err) {
    console.error("❌ Update pricing failed:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete Pricing
exports.deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findOne();
    if (!pricing) {
      return res.status(404).json({ success: false, message: "No pricing found to delete" });
    }

    await Pricing.deleteOne({ _id: pricing._id });

    res.status(200).json({
      success: true,
      message: "Pricing deleted successfully",
    });
  } catch (err) {
    console.error("❌ Delete pricing failed:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Calculate Payable (dynamic based on team size)
exports.calculatePayable = async (req, res) => {
  try {
    const { teamSize } = req.body;
    const pricing = await Pricing.findOne();
    if (!pricing) {
      return res.status(404).json({ success: false, message: "Pricing not set" });
    }

    const { baseCharge, perMemberCharge, gstPercent } = pricing;

    let totalBeforeGST =
      Number(baseCharge) +
      Math.max(0, Number(teamSize) - 1) * Number(perMemberCharge);

    let gstAmount = (totalBeforeGST * gstPercent) / 100;
    let totalPayable = totalBeforeGST + gstAmount;

    res.status(200).json({
      success: true,
      data: {
        baseCharge,
        perMemberCharge,
        gstPercent,
        teamSize,
        totalBeforeGST,
        gstAmount,
        totalPayable,
      },
    });
  } catch (err) {
    console.error("❌ Calculation failed:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};