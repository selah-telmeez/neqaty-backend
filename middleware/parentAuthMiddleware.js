const jwt = require('jsonwebtoken');
require('dotenv').config();

const parentAuthMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET_PARENT);
        req.parent = decoded; // { id: parentId, student_id }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { parentAuthMiddleware };