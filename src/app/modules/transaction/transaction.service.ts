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

/* const getAllUsers = async (query: Record<string, string>) => {
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
} */

const getTransactionsById = async (
  userId: string, 
  query: Record<string, string> = {}
) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  // Build the base query
  let baseQuery: any = {
    $or: [{ from: userId }, { to: userId }],
  };

  // Add additional filters if provided
  if (query.type) {
    baseQuery.type = query.type;
  }

  if (query.status) {
    baseQuery.status = query.status;
  }

  if (query.minAmount || query.maxAmount) {
    baseQuery.amount = {};
    if (query.minAmount) baseQuery.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) baseQuery.amount.$lte = Number(query.maxAmount);
  }

  if (query.startDate || query.endDate) {
    baseQuery.createdAt = {};
    if (query.startDate) baseQuery.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) baseQuery.createdAt.$lte = new Date(query.endDate);
  }

  // Add search functionality
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    baseQuery.$or = [
      ...baseQuery.$or,
      { transactionId: searchRegex },
      { reference: searchRegex },
    ];
  }

  // Get total count of transactions
  const total = await Transaction.countDocuments(baseQuery);

  // Calculate total pages
  const totalPage = Math.ceil(total / limit);

  // Get paginated transactions
  const result = await Transaction.find(baseQuery)
    .sort({ [sortBy]: sortOrder })
    .populate('from', 'name email')
    .populate('to', 'name email')
    .skip(skip)
    .limit(limit);

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
  ]);

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
  };
};

/*

const getTransactionsById = async (
  userId: string, 
  query: Record<string, string> = {}
) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  // Build the base query
  let baseMatch: any = {
    $or: [{ from: new mongoose.Types.ObjectId(userId) }, { to: new mongoose.Types.ObjectId(userId) }],
  };

  // Add additional filters if provided
  if (query.type) baseMatch.type = query.type;
  if (query.status) baseMatch.status = query.status;

  if (query.minAmount || query.maxAmount) {
    baseMatch.amount = {};
    if (query.minAmount) baseMatch.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) baseMatch.amount.$lte = Number(query.maxAmount);
  }

  if (query.startDate || query.endDate) {
    baseMatch.createdAt = {};
    if (query.startDate) baseMatch.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) baseMatch.createdAt.$lte = new Date(query.endDate);
  }

  // Create aggregation pipeline
  const aggregationPipeline: any[] = [
    { $match: baseMatch },
    // Lookup from user with minimal fields
    {
      $lookup: {
        from: 'users',
        localField: 'from',
        foreignField: '_id',
        as: 'fromUser',
        pipeline: [
          { $project: { name: 1, email: 1, mobileNumber: 1 } }
        ]
      }
    },
    // Lookup to user with minimal fields
    {
      $lookup: {
        from: 'users',
        localField: 'to',
        foreignField: '_id',
        as: 'toUser',
        pipeline: [
          { $project: { name: 1, email: 1, mobileNumber: 1 } }
        ]
      }
    },
    // Unwind user arrays
    { $unwind: { path: '$fromUser', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$toUser', preserveNullAndEmptyArrays: true } }
  ];

  // Add search functionality if provided
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    aggregationPipeline.push({
      $match: {
        $or: [
          { transactionId: searchRegex },
          { reference: searchRegex },
          { 'fromUser.name': searchRegex },
          { 'fromUser.email': searchRegex },
          { 'fromUser.mobileNumber': searchRegex },
          { 'toUser.name': searchRegex },
          { 'toUser.email': searchRegex },
          { 'toUser.mobileNumber': searchRegex }
        ]
      }
    });
  }

  // Clone pipeline for counting
  const countPipeline = [...aggregationPipeline];
  countPipeline.push({ $count: 'total' });

  // Add sorting, skip, and limit to main pipeline
  aggregationPipeline.push(
    { $sort: { [sortBy]: sortOrder } },
    { $skip: skip },
    { $limit: limit }
  );

  // Execute both queries in parallel
  const [data, countResult, stats] = await Promise.all([
    Transaction.aggregate(aggregationPipeline),
    Transaction.aggregate(countPipeline),
    Transaction.aggregate([
      { $match: baseMatch },
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
  ]);

  const total = countResult[0]?.total || 0;
  const totalPage = Math.ceil(total / limit);

  return {
    data,
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
  };
};

*/ 

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
