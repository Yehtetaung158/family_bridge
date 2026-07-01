import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  token?: string;
  userRole?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
     res.status(401).json({ status: 'Error', message: 'Access token is required' });
     return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'family-bridge-jwt-secret-key-1234';
    const decoded = jwt.verify(token, secret) as { userId: string; email: string };
    req.userId = decoded.userId;
    req.token = token;
    next();
  } catch (error) {
     res.status(403).json({ status: 'Error', message: 'Invalid or expired token' });
     return;
  }
};

export const authorizeRoles = (...roles: ('ADMIN' | 'USER')[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.userId;
      if (!id) {
         res.status(401).json({ status: 'Error', message: 'Unauthorized: No user ID verified' });
         return;
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });

      if (!user) {
         res.status(404).json({ status: 'Error', message: 'User not found' });
         return;
      }

      if (!roles.includes(user.role)) {
         res.status(403).json({ status: 'Error', message: 'Forbidden: You do not have permission to access this resource' });
         return;
      }

      req.userRole = user.role;
      next();
    } catch (error) {
       console.error('Authorization Error:', error);
       res.status(500).json({ status: 'Error', message: 'Internal server error during authorization' });
       return;
    }
  };
};
