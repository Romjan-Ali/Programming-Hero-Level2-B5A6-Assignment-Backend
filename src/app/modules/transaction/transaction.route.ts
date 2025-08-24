import express from 'express'
import { TransactionController } from './transaction.controller'
import { validateRequest } from '../../middlewares/validateRequest'
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
} from './transaction.validation'
import { checkAuth } from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = express.Router()

router.post(
  '/',
  validateRequest(createTransactionSchema),
  TransactionController.createTransaction
)

router.get('/my-history', checkAuth(Role.USER), TransactionController.getTransactionsById)

router.patch(
  '/:id/status',
  validateRequest(updateTransactionStatusSchema),
  TransactionController.updateTransactionStatus
)

router.delete('/:id', TransactionController.deleteTransaction)

export const TransactionRoutes = router
