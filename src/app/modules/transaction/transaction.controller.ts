import type { Request, Response } from 'express'
import httpStatus from '../../utils/httpStatus'
import { catchAsync } from '../../utils/catchAsync'
import { sendResponse } from '../../utils/sendResponse'
import { TransactionServices } from './transaction.service'
import { type ITransaction } from './transaction.interface'
import type { JwtPayload } from 'jsonwebtoken'

export const createTransaction = catchAsync(
  async (req: Request, res: Response) => {
    const transactionData: ITransaction = req.body
    const result = await TransactionServices.createTransaction(transactionData)

    sendResponse<ITransaction>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Transaction created successfully',
      data: result,
    })
  }
)

export const getAllTransactions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TransactionServices.getAllTransactions()

    sendResponse<ITransaction[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Transactions retrieved successfully',
      data: result,
    })
  }
)

export const getTransactionsById = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.user as JwtPayload
    const result = await TransactionServices.getTransactionsById(userId)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Transactions retrieved successfully',
      data: result,
    })
  }
)

export const updateTransactionStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { status } = req.body
    const result = await TransactionServices.updateTransactionStatus(id, status)

    sendResponse<ITransaction | null>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Transaction status updated successfully',
      data: result,
    })
  }
)

export const deleteTransaction = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await TransactionServices.deleteTransaction(id)

    sendResponse<ITransaction | null>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Transaction deleted successfully',
      data: result,
    })
  }
)

export const TransactionController = {
  createTransaction,
  getAllTransactions,
  getTransactionsById,
  updateTransactionStatus,
  deleteTransaction,
}
