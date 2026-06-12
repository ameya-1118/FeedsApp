import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
username:{
  type:String,
  required:true,
  unique:true,
  trim:true
},
email:{ type:String, unique:true },
phone:String,
password:String,
avatar:{ type:String, default:"https://api.dicebear.com/7.x/avataaars/svg?seed=default" },
role:{ type:String, enum:["admin","user"], default:"user" },

isVerified:{ type:Boolean, default:false },

otp:String,
otpPurpose:String,
otpExpires:Date
},
{ timestamps:true }
);

userSchema.index({ username: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
