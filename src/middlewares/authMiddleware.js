import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try{
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) 
      return res.status(401).json({ message: 'Unauthorized' });

    const token = header.split(' ')[1]?.trim();

    const payload = verifyToken(token);
    
    if (!payload || !payload.id || !payload.role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = payload;
    next();
  }catch(err){
    return res.status(401).json({message: 'Invalid or expired token'})
  }
  
};
