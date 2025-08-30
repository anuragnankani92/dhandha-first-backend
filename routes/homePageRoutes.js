const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadData, getData, editData, deleteData } = require('../controller/homePageController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), uploadData);
router.get('/all', getData);
router.put('/editData/:id', upload.single('image'), editData);
router.delete('/deleteData/:id', deleteData)

module.exports = router;
