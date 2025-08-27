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

/* const getAllTransactions = async (query: Record<string, string>) => {
  // console.log()

  // Build search query
  let searchQuery = {}
  const q = query

  console.log({ q })

  if (query) {
    searchQuery = {
      $or: [
        // { transactionId: { $regex: q, $options: 'i' } },
        // { 'from.name': { $regex: q, $options: 'i' } },
        // { 'from.email': { $regex: `${query}`, $options: 'i' } },
        // { 'to.name': { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
        // { status: { $regex: q, $options: 'i' } },
        // { reference: { $regex: q, $options: 'i' } },
      ],
    }
  }

  const result = await Transaction.find({
    $or: [
      { type: { $regex: 'in' } },
      // { Title: { $regex: `${query}` } },
    ],
  })

  console.log('result', result)

  // const aggregateResult = awiat Transaction.aggregate([])

  const queryBuilder = new QueryBuilder(Transaction.find(), {
    $or: [
      { type: { $regex: 'in', $options: 'i' } }, // Correct: Regex for the 'type' field
      { reference: { $regex: 'in', $options: 'i' } }, // Correct: Regex for the 'reference' field
    ],
  })

  // const queryBuilder = new QueryBuilder(aggregateResult, query)

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
} */

/* const getAllTransactions = async (query: Record<string, string>) => {
  // Build search query
  let searchQuery: any = {}
  const q = query || ''

  console.log({ q })

  if (q) {
    searchQuery = {
      $or: [
        // { type: { $regex: q.type, $options: 'i' } },
        // { status: { $regex: q, $options: 'i' } },
        { reference: { $regex: q.reference, $options: 'i' } },
        // { 'from.name': { $regex: q.name, $options: 'i' } },
        // { 'from.email': { $regex: q.email, $options: 'i' } },
        // { 'to.name': { $regex: q, $options: 'i' } },
        // { 'to.email': { $regex: q, $options: 'i' } },
      ],
    }
  }

  // Pagination and limit setup
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit

  // Fetch transactions with searchQuery applied and pagination
  const transactionsData = await Transaction.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .populate(['from', 'to']) // Populating 'from' and 'to' user details

  // Get the total count of matching documents (to calculate pagination)
  const totalDocuments = await Transaction.countDocuments(searchQuery)
  const totalPage = Math.ceil(totalDocuments / limit)

  const meta = {
    page,
    limit,
    total: totalDocuments,
    totalPage,
  }

  return {
    data: transactionsData,
    meta,
  }
} */

/* const getAllTransactions = async (query: Record<string, string>) => {
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 1)
  const skip = (page - 1) * limit

  const searchTerm = query.searchTerm || undefined

  let searchQuery

  if (searchTerm) {
    // First, find users that match the search term
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    }).select('_id')

    const matchingUserIds = matchingUsers.map((user) => user._id)

    // Then, find transactions that either:
    // 1. Match the search term in transaction fields, OR
    // 2. Involve users that match the search term

    searchQuery = {
      $or: [
        // Search in transaction fields
        {
          $or: [
            { type: { $regex: searchTerm, $options: 'i' } },
            { status: { $regex: searchTerm, $options: 'i' } },
            { reference: { $regex: searchTerm, $options: 'i' } },
          ],
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
  }

  const transactions = await Transaction.find(searchQuery || {})
    .skip(skip)
    .limit(limit)
    .populate(['from', 'to'])
    .sort({ createdAt: -1 })

  const total = await Transaction.countDocuments(searchQuery || {})

  return {
    data: transactions,
    meta: {
      page: page,
      limit: limit,
      total: total,
      totalPage: Math.ceil(total / limit),
    },
  }
} */

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
