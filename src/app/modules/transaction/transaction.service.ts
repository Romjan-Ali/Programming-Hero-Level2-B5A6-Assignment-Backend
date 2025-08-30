import { Transaction } from './transaction.model'
import { type ITransaction } from './transaction.interface'
import { Types } from 'mongoose'
import type { JwtPayload } from 'jsonwebtoken'

const createTransaction = async (
  payload: ITransaction
): Promise<ITransaction> => {
  const transaction = await Transaction.create(payload)
  return transaction
}

const getAllTransactions = async (): Promise<ITransaction[]> => {
  return await Transaction.find()
}

const getTransactionsById = async (
  userId: string,
  query: Record<string, string> = {}
) => {
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 10)
  const skip = (page - 1) * limit
  const sortBy = query.sortBy || 'createdAt'
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1

  // Build the base query
  let baseQuery: any = {
    $or: [{ from: userId }, { from: null }, { to: userId }, { to: null }],
  }

  // Add additional filters if provided
  if (query.type) {
    baseQuery.type = query.type
  }

  if (query.status) {
    baseQuery.status = query.status
  }

  if (query.minAmount || query.maxAmount) {
    baseQuery.amount = {}
    if (query.minAmount) baseQuery.amount.$gte = Number(query.minAmount)
    if (query.maxAmount) baseQuery.amount.$lte = Number(query.maxAmount)
  }

  if (query.startDate || query.endDate) {
    baseQuery.createdAt = {}

    if (query.startDate) {
      const startDate = new Date(query.startDate)
      startDate.setHours(0, 0, 0, 0)
      baseQuery.createdAt.$gte = startDate
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate)
      endDate.setHours(23, 59, 59, 999)
      baseQuery.createdAt.$lte = endDate
    }
  }

  // Add search functionality
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i')
        baseQuery.$or = [
      ...(baseQuery.$or || []),
      { reference: searchRegex },
    ]
  }

  // Get total count of transactions
  const total = await Transaction.countDocuments(baseQuery)

  // Calculate total pages
  const totalPage = Math.ceil(total / limit)

  // Get paginated transactions
  const result = await Transaction.find(baseQuery)
    .sort({ [sortBy]: sortOrder })
    .populate({
      path: 'from',
      select: 'name email',
    })
    .populate({
      path: 'to',
      select: 'name email',
    })
    .skip(skip)
    .limit(limit)

  // Calculate additional statistics
  const stats = await Transaction.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        pendingTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        failedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
        },
      },
    },
  ])

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPage,
      hasNextPage: page < totalPage,
      hasPrevPage: page > 1,
      stats: stats[0] || {
        totalAmount: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      },
    },
  }
}

const updateTransactionStatus = async (
  id: string,
  status: ITransaction['status']
): Promise<ITransaction | null> => {
  return Transaction.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
}

const deleteTransaction = async (id: string): Promise<ITransaction | null> => {
  return Transaction.findByIdAndDelete(id)
}

export const TransactionServices = {
  createTransaction,
  getAllTransactions,
  getTransactionsById,
  updateTransactionStatus,
  deleteTransaction,
}
