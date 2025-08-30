const express = require("express");
const router = express.Router();

const {
  setPricing,
  getPricing,
  calculatePayable,
  updatePricing,
  deletePricing
} = require("../controller/startUpPricingController");

router.post("/setPricing", setPricing);
router.get("/getPricing", getPricing);
router.put("/updatePricing", updatePricing);
router.delete("/deletePricing", deletePricing);

// Public route to calculate total for given team size
router.post("/calculate", calculatePayable);

module.exports = router;