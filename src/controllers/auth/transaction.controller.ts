import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import prisma from '../../services/prisma';

export const requestTopUp = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, description } = req.body;
        const userId = req.userId;

        if (!amount || Number(amount) <= 0) {
            res.status(400).json({ status: 'Error', message: 'Invalid top up amount' });
            return;
        }

        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized. User ID missing.' });
            return;
        }

        const userWallet = await prisma.wallet.findUnique({
            where: { userId: userId }
        });

        if (!userWallet) {
            res.status(444).json({ status: 'Error', message: 'Wallet not found for this user' });
            return;
        }

        const transaction = await prisma.walletTransaction.create({
            data: {
                walletId: userWallet.id,
                amount: Number(amount),
                type: 'CREDIT',
                status: 'PENDING',
                description: description || 'User requested top up'
            }
        });

        res.status(201).json({
            status: 'OK',
            message: 'Top up request submitted successfully. Waiting for admin approval.',
            data: transaction
        });

    } catch (error) {
        console.error('Error requesting top up:', error);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

export const transactionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized. User ID missing.' });
            return;
        }

        const transactions = await prisma.walletTransaction.findMany({
            where: { wallet: { userId: userId } },
            select: {
                id: true,
                amount: true,
                type: true,
                status: true,
                description: true,
                createdAt: true
            },
        });

        res.status(200).json({
            status: 'OK',
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;

        const totalTransactions = await prisma.walletTransaction.count();

        const transactions = await prisma.walletTransaction.findMany({
            skip: skip,
            take: limit,
            select: {
                id: true,
                amount: true,
                type: true,
                status: true,
                description: true,
                createdAt: true,
                wallet: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalPages = Math.ceil(totalTransactions / limit);

        res.status(200).json({
            status: 'OK',
            meta: {
                totalItems: totalTransactions,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

export const getTransactionDetailsByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        if (!id) {
            res.status(400).json({ status: 'Error', message: 'Transaction ID is required' });
            return;
        }

        const transaction = await prisma.walletTransaction.findUnique({
            where: { id },
            select: {
                id: true,
                amount: true,
                type: true,
                status: true,
                description: true,
                createdAt: true,
                wallet: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
        });

        if (!transaction) {
            res.status(404).json({ status: 'Error', message: 'Transaction not found' });
            return;
        }

        res.status(200).json({
            status: 'OK',
            data: transaction
        });
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

export const transactionApprove = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { action } = req.body; // action: 'APPROVE' | 'REJECT'

        if (!id) {
            res.status(400).json({ status: 'Error', message: 'Transaction ID is required' });
            return;
        }

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            res.status(400).json({ status: 'Error', message: 'action must be either APPROVE or REJECT' });
            return;
        }

        // Find the transaction first
        const existing = await prisma.walletTransaction.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({ status: 'Error', message: 'Transaction not found' });
            return;
        }

        if (existing.status !== 'PENDING') {
            res.status(400).json({
                status: 'Error',
                message: `Transaction is already ${existing.status}. Only PENDING transactions can be actioned.`
            });
            return;
        }

        if (action === 'APPROVE') {
            // Use Prisma $transaction to atomically update both records
            const [updatedTransaction] = await prisma.$transaction([
                prisma.walletTransaction.update({
                    where: { id },
                    data: { status: 'APPROVED' },
                }),
                prisma.wallet.update({
                    where: { id: existing.walletId },
                    data: {
                        balance: {
                            increment: existing.amount,
                        },
                    },
                }),
            ]);

            res.status(200).json({
                status: 'OK',
                message: 'Transaction approved and wallet balance updated.',
                data: updatedTransaction,
            });
        } else {
            // REJECT — only update transaction status, do NOT touch wallet balance
            const updatedTransaction = await prisma.walletTransaction.update({
                where: { id },
                data: { status: 'REJECTED' },
            });

            res.status(200).json({
                status: 'OK',
                message: 'Transaction rejected.',
                data: updatedTransaction,
            });
        }
    } catch (error) {
        console.error('Error processing transaction approval:', error);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};