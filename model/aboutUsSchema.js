const mongoose = require("mongoose");

// Schema for AnnouncingDhandaFirst
const AnnouncingDhandaFirstSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String, // You can store image URL or file path
      required: false,
    },
  },
  { timestamps: true }
);

// Schema for BharatFirstUnfolding
const BharatFirstUnfoldingSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String, // You can store image URL or file path
      required: false,
    },
  },
  { timestamps: true }
);

const AnnouncingDhandaFirstModel = mongoose.model(
  "AnnouncingDhandaFirst",
  AnnouncingDhandaFirstSchema
);

const BharatFirstUnfoldingModel = mongoose.model(
  "BharatFirstUnfolding",
  BharatFirstUnfoldingSchema
);

module.exports = {
  AnnouncingDhandaFirstModel,
  BharatFirstUnfoldingModel,
};
