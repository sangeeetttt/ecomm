import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    isAdmin: {
      type: Boolean,
      default: false, // Set to false by default
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
