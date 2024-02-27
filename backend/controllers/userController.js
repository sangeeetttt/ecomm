import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const isPasswordCommon = (password) => {
  const commonPasswords = ["password", "123456", "qwerty"];
  return commonPasswords.includes(password.toLowerCase());
};

const isPasswordValid = (password) => {
  // Password must be at least 8 characters long
  if (password.length < 8) return false;

  // Password must contain at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) return false;

  // Password must contain at least one uppercase letter
  if (!/[A-Z]+/.test(password)) return false;

  return true;
};

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username and password are the same
    if (username === password) {
      throw new Error("Username and password cannot be the same.");
    }

    // Check password complexity
    if (!isPasswordValid(password)) {
      throw new Error("The password must have 8 characters, one special character, and a capital letter.");
    }

    if (isPasswordCommon(password)) {
      throw new Error("Password is too common.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "Registered Successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
      return res.status(400).json({ error: `Please try again in ${remainingTime} seconds.` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      await User.updateOne({ _id: user._id }, { $set: { loginAttempts: 0, lockUntil: null } });
      createToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      return;
    } else {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 3 * 60 * 1000);
        await user.save();
        return res.status(400).json({ error: "Too many unsuccessful login attempts. Account locked for 3 minutes." });
      } else {
        await user.save();
        return res.status(400).json({ error: "Incorrect email or password." });
      }
    }
  } else {
    return res.status(400).json({ error: "User not found." });
  }
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { username, email, oldPassword, newPassword } = req.body;

    if (oldPassword) {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(400).json({ error: "Old password is incorrect." });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};
