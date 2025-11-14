import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) 
    return res.status(401).json({ message: 'Unauthorized' });

  const token = header.split(' ')[1]?.trim();

  const payload = verifyToken(token);
  
  if (!payload) return res.status(401).json({ message: 'Invalid or expired token' });

  req.user = payload;
  next();
};
