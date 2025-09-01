import bcryptjs from 'bcryptjs'
import httpStatus from 'http-status-codes'
import { type JwtPayload } from 'jsonwebtoken'
import { envVars } from '../../config/env.ts'
import AppError from '../../errorHelpers/AppError'
import { QueryBuilder } from '../../utils/QueryBuilder'
import { userSearchableFields } from './user.constant'
import { type IAuthProvider, type IUser, Role } from './user.interface'
import { User } from './user.model'
import { WalletServices } from '../wallet/wallet.service'
import { Wallet } from '../wallet/wallet.model'
import mongoose from 'mongoose'

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload

  const isUserExist = await User.findOne({ email })

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User Already Exist')
  }

  if (password) {
    payload.password = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    )
  }

  let authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  }

  if (payload?.auths?.[0].provider) {
    authProvider = {
      provider: payload?.auths?.[0].provider,
      providerId: payload?.auths?.[0].providerId as string,
    }
  }

  if (payload.role === Role.AGENT && payload.isApproved === undefined) {
    payload.isApproved = true
  }

  payload.auths = [authProvider]

  const user = await User.create(payload)

  if (user && (user.role === Role.USER || user.role === Role.AGENT)) {
    await WalletServices.createWallet(user?._id.toString(), user.role)
  }

  return user
}

const updateUser = async (
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  // Check if user exists
  const existingUser = await User.findById(decodedToken?.userId)
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  // Regular users can only update themselves
  if (existingUser.role !== decodedToken.role) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'You are not authorized to edit profile'
    )
  }

  // Regular users cannot update role, isActive, isDeleted, or isVerified
  if (decodedToken.role === (Role.USER || Role.AGENT)) {
    const forbiddenFields = ['role', 'isActive', 'isDeleted', 'isVerified']
    forbiddenFields.forEach((field) => {
      if (field in payload) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'You are not authorized to update this field'
        )
      }
    })
  }

  // Perform update
  const updatedUser = await User.findByIdAndUpdate(decodedToken?.userId, payload, {
    new: true,
    runValidators: true,
  })

  return updatedUser
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

/* const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query)
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate()

  // Build the query with wallet population
  const usersQuery = usersData.build().populate('wallet')

  const [data, meta] = await Promise.all([
    usersQuery.exec(),
    usersData.getMeta(),
  ])

  return {
    data,
    meta,
  }
} */

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query)
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate()

  const [users, meta] = await Promise.all([
    usersData.build().exec(),
    usersData.getMeta(),
  ])

  // Get wallet data for all users
  const userIds = users.map((user) => user._id)
  const wallets = await Wallet.find({ user: { $in: userIds } })

  // Combine user and wallet data
  const usersWithWallets = users.map((user) => {
    const userWallet = wallets.find(
      (wallet) => wallet.user.toString() === user._id.toString()
    )
    return {
      ...user.toObject(),
      wallet: userWallet || null,
    }
  })

  return {
    data: usersWithWallets,
    meta,
  }
}

const changeUserStatus = async (userId: string, status: string) => {
  if (status === undefined || !userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please send all requiered fields.'
    )
  }

  const statusTypes = ['ACTIVE', 'INACTIVE', 'BLOCKED']

  if (!statusTypes.includes(status.toUpperCase())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status type.')
  }

  const result = await User.findByIdAndUpdate(
    userId,
    { isActive: status.toUpperCase() },
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

const deleteUser = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID')
  }

  // Mark the user as deleted and deactivate
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true, isActive: false },
    { new: true }
  )

  if (!user) {
    throw new Error('User not found')
  }

  // deactivate user's wallet(s)
  await Wallet.updateOne({ user: user._id }, { isActive: false })

  return user
}

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select('-password')
  return {
    data: user,
  }
}

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-password')
  return {
    data: user,
  }
}

export const UserServices = {
  createUser,
  getAllUsers,
  changeUserStatus,
  getSingleUser,
  updateUser,
  getMe,
  deleteUser,
}
