const { hashPassword, comparePassword } = require("../utils/password");
const jwt = require("../utils/jwt");
const { User, RefreshToken, Report } = require("../models");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const {
  successResponse,
  errorResponse,
  successCreatedResponse,
} = require("../utils/response");

const register = async (req, res) => {
  const { name, email, password, password_confirmation } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "User already exists", 400);
    }

    if (password !== password_confirmation) {
      return errorResponse(res, "Password confirmation does not match", 400);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "user",
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

    return successCreatedResponse(
      res,
      "Registration successful",
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      201
    );
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid email or password", 401);
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

    return successResponse(res, "Login successful", {
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
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const forgotPasswordWeb = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return successResponse(
        res,
        "If a user with this email exists, a password reset link will be sent",
        200
      );
    }

    const resetToken = jwt.generateResetToken(user);
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 3600000);
    expirationTime.setHours(expirationTime.getHours() + 7);
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: expirationTime,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendResetEmail(user, resetUrl, "web");

    return successResponse(res, "Password reset link sent");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const forgotPasswordAndroid = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return successResponse(
        res,
        "If a user with this email exists, a password reset code will be sent",
        200
      );
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const now = new Date();
    const expirationTime = new Date(now.getTime() + 3600000);
    expirationTime.setHours(expirationTime.getHours() + 7);

    await user.update({
      resetPasswordCode: resetCode,
      resetPasswordExpires: expirationTime,
    });

    await sendResetEmail(user, resetCode, "android");

    return successResponse(res, "Password reset code sent");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({
      where: {
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset code", 400);
    }

    return successResponse(res, "Reset code verified successfully");
  } catch (error) {
    console.log(error);
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const sendResetEmail = async (user, resetData, platform) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let emailContent;

  if (platform === "web") {
    emailContent = webEmailTemplate(user, resetData);
  } else {
    emailContent = androidEmailTemplate(user, resetData);
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password Reset Request",
    html: emailContent,
  };

  return transporter.sendMail(mailOptions);
};

const androidEmailTemplate = (user, resetCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #0066cc;
          color: white;
          padding: 15px;
          text-align: center;
          border-radius: 5px 5px 0 0;
          margin-bottom: 20px;
        }
        .content {
          padding: 0 20px;
        }
        .code-container {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
          margin: 20px 0;
        }
        .code {
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #0066cc;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666666;
          border-top: 1px solid #e0e0e0;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kode Reset Password</h1>
        </div>
        <div class="content">
          <p>Halo ${user.name || "Pengguna"},</p>
          <p>Kami menerima permintaan untuk mereset password Anda. Gunakan kode berikut untuk membuat password baru:</p>
          <div class="code-container">
            <div class="code">${resetCode}</div>
          </div>
          <p>Masukkan kode ini di aplikasi untuk melanjutkan proses reset password.</p>
          <p>Jika Anda tidak meminta reset password ini, abaikan email ini.</p>
          <p>Kode ini akan kedaluwarsa dalam 1 jam untuk alasan keamanan.</p>
          <p>Terima kasih,<br>Tim WBS</p>
        </div>
        <div class="footer">
          <p>Ini adalah email otomatis, mohon tidak membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const webEmailTemplate = (user, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #0066cc;
          color: white;
          padding: 15px;
          text-align: center;
          border-radius: 5px 5px 0 0;
          margin-bottom: 20px;
        }
        .content {
          padding: 0 20px;
        }
        .button {
          display: inline-block;
          background-color: #0066cc;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          margin: 20px 0;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666666;
          border-top: 1px solid #e0e0e0;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Password</h1>
        </div>
        <div class="content">
          <p>Halo ${user.name || "Pengguna"},</p>
          <p>Kami menerima permintaan untuk mereset password Anda. Klik tombol di bawah ini untuk membuat password baru:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Jika Anda tidak meminta reset password ini, abaikan email ini.</p>
          <p>Link ini akan kedaluwarsa dalam 1 jam untuk alasan keamanan.</p>
          <p>Terima kasih,<br>Tim WBS</p>
        </div>
        <div class="footer">
          <p>Ini adalah email otomatis, mohon tidak membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const resetPassword = async (req, res) => {
  console.log("Reset password request received:", req.body);
  const { token, new_password } = req.body;

  try {
    const decoded = jwt.verifyResetPasswordToken(
      token,
      process.env.JWT_RESET_PASSWORD_SECRET
    );

    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset token", 400);
    }

    const hashedPassword = await hashPassword(new_password);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return successResponse(res, "Password has been reset successfully");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const resetPasswordAndroid = async (req, res) => {
  const { email, code, new_password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset code", 400);
    }

    const hashedPassword = await hashPassword(new_password);
    await user.update({
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null,
    });
    console.log("Sukses Ganti PW");
    return successResponse(res, "Password has been reset successfully");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const updateProfile = async (req, res) => {
  const { name } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    await user.update({
      name: name,
    });

    return successResponse(res, "Profile updated successfully", {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const updatePassword = async (req, res) => {
  const { current_password, new_password, new_password_confirmation } =
    req.body;

  try {
    if (new_password !== new_password_confirmation) {
      return errorResponse(
        res,
        "New password and confirmation do not match",
        400
      );
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const isPasswordValid = await comparePassword(
      current_password,
      user.password
    );
    if (!isPasswordValid) {
      return errorResponse(res, "Current password is incorrect", 401);
    }

    const hashedPassword = await hashPassword(new_password);

    await user.update({
      password: hashedPassword,
    });

    await RefreshToken.destroy({
      where: {
        userId: user.id,
      },
    });

    return successResponse(res, "Password updated successfully");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const logout = async (req, res) => {
  const refreshToken = req.body.refresh_token;

  try {
    await RefreshToken.destroy({
      where: {
        token: refreshToken,
      },
    });

    return successResponse(res, "Logout successful");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const reportCount = await Report.count({
      where: {
        userId: user.id,
        is_anonymous: false,
      },
    });

    return successResponse(res, "User profile fetched", {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        reportCount: reportCount,
      },
    });
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

const getToken = async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const existingToken = await RefreshToken.findOne({
      where: {
        token: refresh_token,
      },
    });

    if (!existingToken) {
      return errorResponse(res, "Invalid refresh token", 401);
    }

    const user = await User.findByPk(existingToken.userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const newAccessToken = jwt.generateAccessToken(user);

    return successResponse(res, "Token refreshed successfully", {
      access_token: newAccessToken,
      token_type: "Bearer",
    });
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error.message);
  }
};

module.exports = {
  register,
  login,
  forgotPasswordWeb,
  forgotPasswordAndroid,
  verifyResetCode,
  resetPassword,
  resetPasswordAndroid,
  updateProfile,
  updatePassword,
  logout,
  getProfile,
  getToken,
};
