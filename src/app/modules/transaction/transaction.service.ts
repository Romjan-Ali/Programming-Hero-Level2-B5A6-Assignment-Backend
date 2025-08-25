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

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query)
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    usersData.build(),
    usersData.getMeta(),
  ])

  return {
    data,
    meta,
  }
}

const getTransactionsById = async (userId: string) => {
  const result = await Transaction.find({
    $or: [{ from: userId }, { to: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('from', 'name email')
    .populate('to', 'name email');
  return result
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
