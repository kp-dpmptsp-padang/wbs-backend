const { hashPassword } = require('../utils/password');
const jwt = require('../utils/jwt');
const { User } = require('../models');

const register = async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
            role
        });

        // Generate JWT token
        const token = jwt.generateToken(newUser);

        res.status(201).json({ message: 'User registered successfully', user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const login = (req, res) => {
    // Implement login logic here
    res.send('User logged in successfully');
};

const forgotPassword = (req, res) => {
    // Implement forgot password logic here
    res.send('Password reset link sent');
};

const updateProfile = (req, res) => {
    // Implement update profile logic here
    res.send('Profile updated successfully');
};

const updatePassword = (req, res) => {
    // Implement update password logic here
    res.send('Password updated successfully');
};

module.exports = {
    register,
    login,
    forgotPassword,
    updateProfile,
    updatePassword
};