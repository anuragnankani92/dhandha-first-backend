const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  register,
  verifyPayment,
  getAll,
  getOne,
  setPricing,
  getPricing,
  calculatePayable
} = require("../controller/startUpController");

// Multer for pitchdeck PDF (Section 1.7)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".pdf") return cb(new Error("Only PDF allowed"));
  cb(null, true);
};
const upload = multer({ storage, fileFilter });

// Routes
router.post("/register", upload.single("pitchdeckPdf"), register);
router.post("/verify-payment", verifyPayment);
router.get("/all", getAll);
router.get("/:id", getOne);


module.exports = router;



// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const { registerStartup, verifyPayment, submitPitch } = require("../controller/startupRegistrationController");

// // Multer for pitch PDF upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// // Routes
// router.post("/register", registerStartup);
// router.post("/verify-payment", verifyPayment);
// router.post("/submit-pitch", upload.single("pitchPdf"), submitPitch);

// module.exports = router;
