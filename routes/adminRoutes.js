// const express = require('express');
// const adminRoute = express.Router();
// const adminController = require('../controller/adminController');

// adminRoute.post("/addAdmin",adminController.createAdmin);
// adminRoute.put("/updateAdmin/:id", adminController.updateAdmin);
// adminRoute.delete("/deleteAdmin/:id", adminController.deleteAdmin);
// adminRoute.post("/loginAdmin", adminController.loginAdmin);

// module.exports = adminRoute;



const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  sendOtp,
  verifyOtp,
  updatePassword
} = require("../controller/adminController");

// Multer (if you want admin profile image upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.post("/create", upload.single("image"), createAdmin);
router.get("/all", getAdmins);
router.get("/:id", getAdminById);
router.put("/update/:id", upload.single("image"), updateAdmin);
router.delete("/delete/:id", deleteAdmin);
router.post("/loginAdmin", loginAdmin);

// OTP Routes (for password update flow)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/update-password", updatePassword);

module.exports = router;
