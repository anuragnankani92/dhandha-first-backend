const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  key: String,
  title: String,
  name: String,
  image: String,
  designation: String,
  description: String,
  linkedin_Id: String
}, { timestamps: true });

module.exports = mongoose.model('Data', dataSchema);
