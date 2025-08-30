const Razorpay = require("razorpay");
const crypto = require("crypto");
const StartUp = require('../model/startUpRegistrationSchema');
const nodemailer = require("nodemailer");


// ===== Razorpay instance =====
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper to compute payable
function computeTotal(baseCharge, perMemberCharge, teamSize) {
  const additional = Math.max(0, teamSize - 1);
  return baseCharge + perMemberCharge * additional;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // e.g. your Gmail
    pass: process.env.EMAIL_PASS,     // app password if Gmail
  },
});


/**
 * POST /api/startup/register
 * multipart/form-data with pitchdeckPdf
 * Body includes all form fields (see frontend)
 * Creates DB row (pending), creates Razorpay order, returns order + key + startupId
 */
exports.register = async (req, res) => {
  try {
    const {
      // Section 1
      startupName, industry, stage, description, city, teamSize,

      // Section 2
      founderFullName, founderDesignation, founderEmail, founderMobile, founderLinkedin,

      // Section 3 (JSON stringified array)
      teamMembers,

      // Section 4
      fundingSoughtINR, equityOfferedPercent, useOfFunds, hasRaised, raisedDetails,

      // Section 5
      baseCharge, perMemberCharge, paymentMethod,

      // Section 6
      declarationTruth, declarationRules,
    } = req.body;

    const pitchdeckPdf = req.file ? `/uploads/${req.file.filename}` : "";

    // Calculate payable (server-side source of truth)
    const totalPayable = computeTotal(Number(baseCharge), Number(perMemberCharge), Number(teamSize));

    const startup = await StartUp.create({
      startupName,
      industry,
      stage,
      description,
      city,
      teamSize: Number(teamSize),
      pitchdeckPdf,

      founder: {
        fullName: founderFullName,
        designation: founderDesignation,
        email: founderEmail,
        mobile: founderMobile,
        linkedin: founderLinkedin || "",
      },

      teamMembers: teamMembers ? JSON.parse(teamMembers) : [],

      fundingSoughtINR: Number(fundingSoughtINR),
      equityOfferedPercent: Number(equityOfferedPercent),
      useOfFunds,
      raisedBefore: {
        hasRaised: hasRaised === "true" || hasRaised === true,
        details: raisedDetails || "",
      },

      baseCharge: Number(baseCharge),
      perMemberCharge: Number(perMemberCharge),
      totalPayable,
      paymentMethod,
      declarationTruth: declarationTruth === "true" || declarationTruth === true,
      declarationRules: declarationRules === "true" || declarationRules === true,
    });

    // Create Razorpay Order (amount in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(totalPayable * 100),
      currency: "INR",
      receipt: `receipt_${startup._id}`,
    });

    // persist order id for later verification
    startup.razorpayOrderId = order.id;
    await startup.save();

    res.json({
      msg: "Order created",
      startupId: startup._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      totalPayable,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

/**
 * POST /api/startup/verify-payment
 * Verify signature & update payment status
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { startupId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const startup = await StartUp.findById(startupId);
    if (!startup) return res.status(404).json({ msg: "Startup not found" });

    const signBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signBody.toString())
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;

    startup.paymentStatus = verified ? "success" : "failed";
    startup.razorpayPaymentId = razorpay_payment_id;
    startup.razorpaySignature = razorpay_signature;
    await startup.save();

    if (!verified) return res.status(400).json({ msg: "Signature mismatch", success: false });

    // --- Send Welcome Email ---
    const founderEmail = startup.founder.email;
    const founderName = startup.founder.fullName;

    const mailOptions = {
      from: `"Startup Event Team" <${process.env.EMAIL_USER}>`,
      to: founderEmail,
      subject: "🎉 Registration Successful — Startup Fund Pitching Event",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background:#f9fafb;">
          <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color:#4f46e5;">Welcome ${founderName},</h2>
            <p style="font-size:16px; color:#374151;">
              ✅ Your application has been <strong>submitted successfully</strong> and we’ve received your payment.
            </p>
            <p style="font-size:16px; color:#374151;">
              Thank you for registering for the <strong>Startup Fund Pitching Event</strong>.
              Our team will review your details and get back to you with next steps.
            </p>
            <div style="margin:30px 0; text-align:center;">
              <a href="" 
                 style="background:#4f46e5; color:white; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:16px;">
                 Visit Event Page
              </a>
            </div>
            <p style="font-size:14px; color:#6b7280;">
              If you have questions, feel free to reply to this email.<br/>
              Best wishes,<br/>Startup Event Team
            </p>
          </div>
        </div>
      `,
    };

    // fire email (do not block response if error)
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Email error:", err);
      else console.log("Email sent:", info.response);
    });

    res.json({ msg: "Payment verified & email sent", success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// exports.verifyPayment = async (req, res) => {
//   try {
//     const { startupId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const startup = await StartUp.findById(startupId);
//     if (!startup) return res.status(404).json({ msg: "Startup not found" });

//     const signBody = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(signBody.toString())
//       .digest("hex");

//     const verified = expectedSignature === razorpay_signature;

//     startup.paymentStatus = verified ? "success" : "failed";
//     startup.razorpayPaymentId = razorpay_payment_id;
//     startup.razorpaySignature = razorpay_signature;
//     await startup.save();

//     if (!verified) return res.status(400).json({ msg: "Signature mismatch", success: false });

//     res.json({ msg: "Payment verified", success: true });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };

// (optional) GET one
exports.getOne = async (req, res) => {
  try {
    const doc = await StartUp.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: "Not found" });
    res.json(doc);
  } catch {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// (optional) GET all
exports.getAll = async (_req, res) => {
  try {
    const docs = await StartUp.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};






// const StartUp = require("../model/startupSchema");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const path = require("path");

// // ✅ Configure Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || "bjhgdigdhdgjkahduadgu",
//   key_secret: process.env.RAZORPAY_KEY_SECRET || "hagfuighbdjkfagkfg",
// });

// // STEP 1: Create Order
// exports.registerStartup = async (req, res) => {
//   try {
//     const { fullname, email, mobile, organisation, amount } = req.body;

//     if (!fullname || !email || !mobile || !organisation || !amount) {
//       return res.status(400).json({ msg: "All fields are required" });
//     }

//     // Create DB entry with pending payment
//     const newStartup = await StartUp.create({
//       fullname,
//       email,
//       mobile,
//       organisation,
//       amount,
//     });

//     // Create Razorpay Order
//     const options = {
//       amount: amount * 100, // amount in paise
//       currency: "INR",
//       receipt: `receipt_${newStartup._id}`,
//     };

//     const order = await razorpay.orders.create(options);

//     res.json({
//       msg: "Order created",
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       startupId: newStartup._id,
//       keyId: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };

// // STEP 1B: Verify Payment
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, startupId } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       await StartUp.findByIdAndUpdate(startupId, { paymentStatus: "success" });
//       res.json({ msg: "Payment verified successfully", success: true });
//     } else {
//       await StartUp.findByIdAndUpdate(startupId, { paymentStatus: "failed" });
//       res.status(400).json({ msg: "Payment verification failed", success: false });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };

// // STEP 2: Submit Pitch
// exports.submitPitch = async (req, res) => {
//   try {
//     const { startupId, pitchText } = req.body;
//     const pdfFile = req.file ? `/uploads/${req.file.filename}` : "";

//     const updated = await StartUp.findByIdAndUpdate(
//       startupId,
//       { pitchText, pitchPdf: pdfFile },
//       { new: true }
//     );

//     res.json({ msg: "Pitch submitted successfully", data: updated });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };
