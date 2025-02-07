const { hashPassword, comparePassword } = require("../utils/password");
const jwt = require("../utils/jwt");
const { User, RefreshToken } = require("../models");

const register = async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    const accessToken = jwt.generateAccessToken(newUser);
    const refreshToken = jwt.generateRefreshToken(newUser);

    const userAgent = req.headers["user-agent"];

    await RefreshToken.create({
      token: refreshToken,
      userId: newUser.id,
      deviceInfo: userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      message: "Registration successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.generateAccessToken(user);
    const refreshToken = jwt.generateRefreshToken(user);

    const userAgent = req.headers["user-agent"];

    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      deviceInfo: userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = (req, res) => {
  // Implement forgot password logic here
  res.send("Password reset link sent");
};

const updateProfile = (req, res) => {
  // Implement update profile logic here
  res.send("Profile updated successfully");
};

const updatePassword = (req, res) => {
  // Implement update password logic here
  res.send("Password updated successfully");
};

module.exports = {
  register,
  login,
  forgotPassword,
  updateProfile,
  updatePassword,
};
