import dotenv from "dotenv";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Mail Error:", error);
  } else {
    console.log("Mailer Ready");
  }
});

transporter.verify((error) => {
  if (error) {
    console.error("Mail Error:", error);
  } else {
    console.log("Mailer Ready");
  }
});
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("Mail Error:", error);
//   } else {
//     console.log("Mailer Ready");
//   }
// });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();

    if (!normalizedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ msg: "Username, email, and password are required" });
    }

    const existingUsername = await User.findOne({ username: normalizedUsername });

    if (existingUsername) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    const exists = await User.findOne({ email: normalizedEmail });

    if (exists) {
      return res.status(400).json({ msg: "Email already exists" });
    }

   const hash = await bcrypt.hash(password, 10);


const otp = generateOTP();

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: normalizedEmail,
  subject: "Email Verification OTP",
  text: `Your OTP is ${otp}`,
});

await User.create({
  username: normalizedUsername,
  email: normalizedEmail,
  phone,
  password: hash,
  role,
  otp,
  otpPurpose: "register",
  otpExpires: new Date(Date.now() + 1000 * 60 * 15),
});

    res.json({ msg: "Registered successfully. OTP sent to email." });

  } catch (error) {
    console.error("Register error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const message = duplicateField === "username"
        ? "Username already taken"
        : duplicateField === "email"
          ? "Email already exists"
          : "Duplicate value already exists";

      return res.status(400).json({ msg: message });
    }

    const isMailError = Boolean(error?.responseCode || error?.code);
    const message = isMailError
      ? "Could not send OTP email. Please check email settings and try again."
      : "Server Error";

    res.status(500).json({ msg: message, error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const email = (req.body.user || req.body.email || "").trim();
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const enteredOTP = String(otp).trim();
    const dbOTP = String(user.otp).trim();

    console.log("Entered OTP:", enteredOTP);
    console.log("DB OTP:", dbOTP);

    if (enteredOTP !== dbOTP) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ msg: "OTP Expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpPurpose = null;
    user.otpExpires = null;

    await user.save();

    res.json({ msg: "Account verified successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify email first" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);

    res.json({
      msg: "Login successful",
      userId: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token,
    });

  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpPurpose = "reset";
    user.otpExpires = new Date(Date.now() + 1000 * 60 * 15);

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ msg: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ msg: "No OTP found for this user" });
    }

    const enteredOTP = String(otp).trim();
    const dbOTP = String(user.otp).trim();

    console.log("Entered OTP:", enteredOTP);
    console.log("DB OTP:", dbOTP);

    if (enteredOTP !== dbOTP) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ msg: "OTP Expired" });
    }

    res.json({ msg: "OTP verified successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const hash = await bcrypt.hash(password, 10);

    user.password = hash;
    user.otp = null;
    user.otpPurpose = null;
    user.otpExpires = null;

    await user.save();

    res.json({ msg: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    res.json({ msg: "Logged out successfully" });

  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username email phone role createdAt")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};
