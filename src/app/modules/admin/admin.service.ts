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
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 10)
  const skip = (page - 1) * limit

  const searchTerm = query.searchTerm || undefined
  const typeFilter = query.type || undefined
  const statusFilter = query.status || undefined

  let searchQuery: any = {}

  // Add exact filters if provided
  if (typeFilter) {
    searchQuery.type = typeFilter // Exact match for type
  }

  if (statusFilter) {
    searchQuery.status = statusFilter // Exact match for status
  }

  if (searchTerm) {
    // First, find users that match the search term
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    }).select('_id')

    const matchingUserIds = matchingUsers.map((user) => user._id)

    // Build search conditions for non-exact fields
    const searchConditions = {
      $or: [
        // Search in transaction fields that don't have exact filters
        {
          $or: [
            // Only search type with regex if we don't have exact type filter
            ...(!typeFilter
              ? [{ type: { $regex: searchTerm, $options: 'i' } }]
              : []),
            // Only search status with regex if we don't have exact status filter
            ...(!statusFilter
              ? [{ status: { $regex: searchTerm, $options: 'i' } }]
              : []),
            { reference: { $regex: searchTerm, $options: 'i' } },
          ].filter(Boolean),
        },
        // Search in user references
        {
          $or: [
            { from: { $in: matchingUserIds } },
            { to: { $in: matchingUserIds } },
          ],
        },
      ],
    }

    // Combine exact filters with search conditions
    if (Object.keys(searchQuery).length > 0) {
      searchQuery = { $and: [searchQuery, searchConditions] }
    } else {
      searchQuery = searchConditions
    }
  }

  const transactions = await Transaction.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .populate(['from', 'to'])
    .sort({ createdAt: -1 })

  const total = await Transaction.countDocuments(searchQuery)

  return {
    data: transactions,
    meta: {
      page: page,
      limit: limit,
      total: total,
      totalPage: Math.ceil(total / limit),
    },
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

const approveOrSuspendAgent = async (agentId: string) => {
  if (!agentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please send all requiered fields.'
    )
  }

  const agent = await User.findById(agentId)
  if (!agent) throw new Error('Agent not found')

  agent.isApproved = !agent.isApproved
  await agent.save()

  if (!agent) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Agent with the provided id is not found.'
    )
  }

  return agent
}

const editProfile = async (user: Record<string, any>, updatedData: Record<string, any>) => {
  console.log({updatedData})
  const result = await User.findById(user.userId) as Record<string, any>;

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin is not found.')
  }

  // Only update keys that exist in the current user document
  Object.keys(updatedData).forEach((key) => {
    if (key in result) {
      result[key] = updatedData[key]
    }
  })

  await result.save()

  return result
}

export const AdminServices = {
  getAllUsers,
  getAllAgents,
  getAllWallets,
  getAllTransactions,
  toggleWalletStatus,
  approveOrSuspendAgent,
  editProfile,
}
