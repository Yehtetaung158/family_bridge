import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import prisma from '../../services/prisma';

export const userProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.userId;
        if (!id) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized: No user ID in token' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                parentPhone: true,
                telegramChatId: true,
                role: true,
                createdAt: true,
                wallet: {
                    select: {
                        balance: true
                    }
                }
            },
        });

        if (!user) {
            res.status(404).json({ status: 'Error', message: 'User not found' });
            return;
        }

        res.status(200).json({
            status: 'OK',
            data: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
        return;
    }
};
