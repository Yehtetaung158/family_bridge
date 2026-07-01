import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { requestTopUp } from '../controllers/auth/transaction.controller';
import { transactionHistory } from '../controllers/auth/transaction.controller';
import { getAllTransactions } from '../controllers/auth/transaction.controller';
import { getTransactionDetailsByAdmin } from '../controllers/auth/transaction.controller';
import { transactionApprove } from '../controllers/auth/transaction.controller';

const router = Router();

router.post('/request_topup', authenticateToken, requestTopUp);
router.get('/transaction_history', authenticateToken, transactionHistory);
router.get('/get_all_transactions', authenticateToken, authorizeRoles("ADMIN"), getAllTransactions);
router.get('/get_all_transactions/:id', authenticateToken, authorizeRoles("ADMIN"), getTransactionDetailsByAdmin);
router.patch('/transactions_approve/:id', authenticateToken, authorizeRoles("ADMIN"), transactionApprove);

export default router;