const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addAnnouncingDhandaFirst,
  getAnnouncingDhandaFirst,
  updateAnnouncingDhandaFirst,
  deleteAnnouncingDhandaFirst,
  addBharatFirstUnfolding,
  getBharatFirstUnfolding,
  updateBharatFirstUnfolding,
  deleteBharatFirstUnfolding,
} = require("../controller/aboutUsController");

// ===== Multer Config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ==================== AnnouncingDhandaFirst Routes ====================
router.post(
  "/announcingDhandaFirst/add",
  upload.single("image"),
  addAnnouncingDhandaFirst
);

router.get(
  "/announcingDhandaFirst/all",
  getAnnouncingDhandaFirst
);

router.put(
  "/announcingDhandaFirst/edit/:id",
  upload.single("image"),
  updateAnnouncingDhandaFirst
);

router.delete(
  "/announcingDhandaFirst/delete/:id",
  deleteAnnouncingDhandaFirst
);

// ==================== BharatFirstUnfolding Routes ====================
router.post(
  "/bharatFirstUnfolding/add",
  upload.single("image"),
  addBharatFirstUnfolding
);

router.get(
  "/bharatFirstUnfolding/all",
  getBharatFirstUnfolding
);

router.put(
  "/bharatFirstUnfolding/edit/:id",
  upload.single("image"),
  updateBharatFirstUnfolding
);

router.delete(
  "/bharatFirstUnfolding/delete/:id",
  deleteBharatFirstUnfolding
);

module.exports = router;



// const express = require('express');
// const route = express.Router();
// const aboutUsController = require('../controller/aboutUsController')

// route.post("/addOrganisers", aboutUsController.addOrganisers);
// route.delete("/deleteOrganisers/:id", aboutUsController.deleteOrganisers);
// route.put("/updateOrganiser/:id",aboutUsController.editOrganisers);
// route.get("/getOrganisers",aboutUsController.getOrganisers)

// module.exports = route;