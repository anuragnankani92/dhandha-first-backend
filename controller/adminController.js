const Admin = require("../model/adminSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpStore = {}; // temporary, better use Redis/DB
const SECRET_KEY = "sdfghtrtsdfgrsedgkfdgdfg";

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, mobile } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ msg: "All fields required" });

    const hashedPwd = await bcrypt.hash(password, 10);
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const newAdmin = await Admin.create({
      username,
      email,
      mobile,
      password: hashedPwd,
      profileImage: image,
    });

    res.status(201).json({ msg: "Admin created successfully", admin: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();

    const updatedAdmins = admins.map(admin => {
      let imagePath = admin.profileImage;

      if (imagePath) {
        // Replace backslashes with forward slashes
        imagePath = imagePath.replace(/\\/g, "/");

        // Ensure it starts with /uploads/
        if (!imagePath.startsWith("/uploads/")) {
          imagePath = "/uploads/" + imagePath.split("/").pop();
        }

        // Build full URL
        imagePath = `${req.protocol}://${req.get("host")}${imagePath}`;
      }

      return {
        ...admin.toObject(),
        profileImage: imagePath
      };
    });

    res.status(200).json(updatedAdmins);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// Get single admin
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ msg: "Admin not found" });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update admin (normal or password update with OTP)
exports.updateAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (req.file) updateData.profileImage = req.file.path;

    // If password is present, force OTP flow
    if (password) {
      return res
        .status(400)
        .json({ msg: "Use OTP verification route to update password" });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({ msg: "Admin updated", admin: updatedAdmin });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Login
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('data', username, password)
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ msg: "Login successful", token });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Send OTP
// exports.sendOtp = async (req, res) => {
//   try {
//     const { email, mobile } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     otpStore[email || mobile] = otp;

//     // Example: sending OTP via email (mobile requires SMS gateway)
//     if (email) {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: { user: "frontenddeveloper923@gmail.com", pass: "asdf asdf asdf qwer" },
//       });

//       await transporter.sendMail({
//         from: "frontenddeveloper923@gmail.com",
//         to: email,
//         subject: "OTP Verification",
//         text: `Your OTP is ${otp}`,
//       });
//     }

//     res.status(200).json({ msg: "OTP sent" });
//   } catch (err) {
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };

const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);


exports.sendOtp = async (req, res) => {
  try {
    const { adminId, method } = req.body;

    // find admin from DB
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // store OTP against email or mobile
    const key = method === "email" ? admin.email : admin.mobile;
    otpStore[key] = otp;
    console.log('admin', admin.email)

    if (method === "email") {
      // send via email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: "masterwasilumar@gmail.com", pass: "aljk ckeq amnd qysb" },
      });

      await transporter.sendMail({
        from: "masterwasilumar@gmail.com",
        to: admin.email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}`,
      });
    } else if (method === "mobile") {
      // send via SMS
      await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: `+91${admin.mobile}`, 
      });
    }

    res.status(200).json({ msg: `OTP sent via ${method}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};



// Verify OTP and update password
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { adminId, otp, newPassword } = req.body;
//     console.log('idd',adminId)

//     const admin = await Admin.findById(adminId);
//     if (!admin) return res.status(404).json({ msg: "Admin not found" });

//     // use email or mobile as key
//     const key = admin.email || admin.mobile;
//     console.log(admin.email,'&&',otp)

//     if (otpStore[key] !== otp) {
//       return res.status(400).json({ msg: "Invalid OTP" });
//     }

//     const hashedPwd = await bcrypt.hash(newPassword, 10);
//     await Admin.findByIdAndUpdate(adminId, { password: hashedPwd });

//     delete otpStore[key];

//     res.status(200).json({ msg: "Password updated successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };

// Temporary stores
// const otpStore = {};
const resetTokenStore = {};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { adminId, otp } = req.body;
    console.log(otp)

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    const key = admin.email || admin.mobile;
    console.log(otp,'&&', admin.email)

    if (otpStore[key] !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // ✅ OTP valid → issue temporary token
    const token = Math.random().toString(36).substring(2, 15);
    resetTokenStore[adminId] = token;

    // cleanup OTP
    delete otpStore[key];

    res.status(200).json({ msg: "OTP verified", token });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Step 3: Update password
exports.updatePassword = async (req, res) => {
  try {
    const { adminId, token, newPassword } = req.body;

    // check reset token
    if (resetTokenStore[adminId] !== token) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    const hashedPwd = await bcrypt.hash(newPassword, 10);
    await Admin.findByIdAndUpdate(adminId, { password: hashedPwd });

    // cleanup token
    delete resetTokenStore[adminId];

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};







// const AdminModal = require('../model/adminSchema');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const SECTRET_KEY = "sdfghtrtsdfgrsedgkfdgdfg"

// exports.createAdmin = async (req, res)=>{

//     const {username, password} = req.body;
//     if(!username || !password){
//         return res.status(400).json({msg:"Username and Password is Required"})
//     }

//     try{
//         const bcryptPassword = await bcrypt.hash(password,10)
//         const adminRecord = await AdminModal.create({
//             username: username,
//             password: bcryptPassword
//         })
//         console.log("adminRecord",adminRecord);
//         return res.status(201).json({msg:"Admin is created Successfully"})

//     }catch(err){
//         console.log("error",err)
//         return res.status(500).json({msg:"Internal Server Error"})
//     }

// }

// exports.updateAdmin= async (req,res)=>{

//     const {username, password}= req.body;
//     const {id} = req.params;

//     if(!id){
//         return res.status(400).json({msg:"ID is Required"})
//     }
//     const updatedAdmin = {};
//     if(username) updatedAdmin.username = username;
//     if(password) updatedAdmin.password = password;

//     try{
//         const updatedRecord = await AdminModal.findByIdAndUpdate(
//             id,
//             {$set:updatedAdmin},
//             {new: true}
//         )
//         console.log("admin",updatedRecord)
//         return res.status(200).json({json:"Admin is Updated Successfully"})

//     }catch(err){
//         console.error("error",err)
//         return res.status(500).json({msg:"Internal Server Error"})
//     }

// }

// exports.deleteAdmin = async (req,res)=>{
//     const {id} = req.params;
//     if(!id){
//         return res.status(400).json({msg:"ID is Required"})
//     }
//     try{
//         const deletedAdmin = await AdminModal.findByIdAndDelete(id)

//         if(!deletedAdmin){
//             return res.status(404).json({msg:"No Record Found"})
//         }
//         return res.status(200).json({msg:"Admin Deleted Successfully"})


//     }catch(err){

//     }

// }

// exports.loginAdmin = async (req, res)=>{
//     const {username, password}= req.body;

//     if(!username || !password){
//         return res.status(400).json({msg:"Username and Password both are Required"});
//     }
//     console.log("post",username,password)

//     try{
//         const record = await AdminModal.findOne({username})
//         console.log('record',record)
       
//         if(!record){
//             return res.status(404).json({msg:"No User Found"})
//         }

//          const comparePassword = await bcrypt.compare(password, record.password);
//          console.log("pwd", comparePassword)

//         if(!comparePassword){
//             return res.status(401).json({msg:"Invalid Password"});
//         }

//         const token = jwt.sign({id:record.id,username:record.username}, SECTRET_KEY,{
//             expiresIn:"1h"
//         })
        
//         return res.status(200).json({msg:"Login Successfull",token})

//     }catch(err){
//         console.log("error", err)
//         return res.status(500).json({msg:"Internal Server error"})
//     }

// }