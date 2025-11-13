import jwt from 'jsonwebtoken';

export const generateToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'})

export const verifyToken = (token) =>
    jwt.sign(token, process.env.JWT_SECRET);