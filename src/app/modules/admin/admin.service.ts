import { User } from '../user/user.model'
import { Wallet } from '../wallet/wallet.model'
import { Transaction } from '../transaction/transaction.model'
import { Role } from '../user/user.interface'
import AppError from '../../errorHelpers/AppError'
import httpStatus from '../../utils/httpStatus'

const getAllUsers = async () => User.find()
const getAllAgents = async () => User.find({ role: Role.AGENT })
const getAllWallets = async () => Wallet.find().populate('user')
const getAllTransactions = async () =>
  Transaction.find().populate(['from', 'to'])

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
