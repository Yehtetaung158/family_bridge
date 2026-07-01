import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import prisma from '../../services/prisma';

export const adminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.userId;

        if (!id) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized: No user ID in token' });
            return;
        }

        const admin = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!admin) {
            res.status(404).json({ status: 'Error', message: 'Admin user not found' });
            return;
        }

        if (admin.role !== 'ADMIN') {
            res.status(403).json({ status: 'Error', message: 'Forbidden: Not an admin account' });
            return;
        }

        res.status(200).json({
            status: 'OK',
            data: admin,
        });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};