import { User } from '../user/user.model'
import { Wallet } from '../wallet/wallet.model'
import { Transaction } from '../transaction/transaction.model'
import { Role } from '../user/user.interface'
import AppError from '../../errorHelpers/AppError'
import httpStatus from '../../utils/httpStatus'
import { QueryBuilder } from '../../utils/QueryBuilder'

const getAllUsers = async () => User.find({ role: Role.USER })
const getAllAgents = async () => User.find({ role: Role.AGENT })
const getAllWallets = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Wallet.find(), query)
  const balanceAggregate = await Wallet.aggregate([
    {
      $group: {
        _id: null,
        totalBalance: {
          $sum: '$balance',
        },
      },
    },
  ])
  const totalBalance = balanceAggregate?.[0]?.totalBalance

  const walletsData = queryBuilder.filter().sort().fields().paginate()

  const [data, meta] = await Promise.all([
    walletsData.build(),
    walletsData.getMeta(),
  ])

  return {
    data,
    meta: { ...meta, totalBalance },
  }
}

const getAllTransactions = async (query: Record<string, string>) => {
  console.log()

  // Build search query
  let searchQuery = {}
  const q = query

  console.log({q})

  if (q) {
    searchQuery = {
      $or: [
        // { transactionId: { $regex: q, $options: 'i' } },
        // { 'from.name': { $regex: q, $options: 'i' } },
        { 'from.email': { $regex: q, $options: 'i' } },
        // { 'to.name': { $regex: q, $options: 'i' } },
        // { type: { $regex: q, $options: 'i' } },
        // { status: { $regex: q, $options: 'i' } },
        // { reference: { $regex: q, $options: 'i' } },
      ],
    }
  }

  const queryBuilder = new QueryBuilder(Transaction.find(searchQuery), query)

  // Get transactions with query builder
  const transactionsData = queryBuilder
    // .dateFilter()
    .filter()
    .sort()
    .paginate()

  const [data, meta] = await Promise.all([
    transactionsData.build().populate(['from', 'to']),
    transactionsData.getMeta(),
  ])

  return {
    data,
    meta,
  }
}

const toggleWalletStatus = async (walletId: string, status: boolean) => {
  if (status === undefined || !walletId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please send all requiered fields.'
    )
  }
  const result = await Wallet.findByIdAndUpdate(
    walletId,
    { isActive: status },
    { new: true }
  )

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Wallet with the provided id is not found.'
    )
  }

  return result
}

const approveOrSuspendAgent = async (agentId: string, active: boolean) => {
  if (active === undefined || !agentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please send all requiered fields.'
    )
  }
  const result = await User.findByIdAndUpdate(
    agentId,
    { isApproved: active },
    { new: true }
  )

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Agent with the provided id is not found.'
    )
  }

  return result
}

export const AdminServices = {
  getAllUsers,
  getAllAgents,
  getAllWallets,
  getAllTransactions,
  toggleWalletStatus,
  approveOrSuspendAgent,
}
