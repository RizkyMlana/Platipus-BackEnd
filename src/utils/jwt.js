import jwt from 'jsonwebtoken';

export const generateToken = (payload) => 
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error(err.message);
        return null; 
    }
};
