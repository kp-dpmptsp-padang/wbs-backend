const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, process.env.JWT_TOKEN, { expiresIn: '1h' });
};

module.exports = {
    generateToken
};