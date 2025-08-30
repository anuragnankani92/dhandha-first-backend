// models/adminSchema.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  mobile:   { type: String, unique: true, sparse: true },
  profileImage: { type: String, default: "" }, // /uploads/filename.jpg

  password: { type: String, required: true },

  // OTP flow
  otpHash:   { type: String, default: null },
  otpExpiry: { type: Date,   default: null },
  otpMethod: { type: String, enum: ['email', 'mobile', null], default: null },
}, { timestamps: true });

module.exports = mongoose.model("Admin", AdminSchema);






// const mongoose = require('mongoose');

// const AdminSchema = new mongoose.Schema({
//     username:{
//         type: String,
//         required: true,
//         unique: true
//     },
//     password:{
//         type: String,
//         required: true
//     }
// },{timestamps: true})

// const AdminModal = mongoose.model("admin",AdminSchema)
// module.exports = AdminModal;