import { Wallet } from './wallet.model'
import { Types } from 'mongoose'
import { User } from '../user/user.model'
import AppError from '../../errorHelpers/AppError'
import httpStatus from '../../utils/httpStatus'
import type { Role } from '../user/user.interface'
import { Transaction } from '../transaction/transaction.model'
import {
  TransactionStatus,
  TransactionType,
  type ITransaction,
} from '../transaction/transaction.interface'

// Create a wallet for a user
const createWallet = async (userId: string, type: Role.USER | Role.AGENT) => {
  const existingWallet = await Wallet.findOne({ user: userId })
  if (existingWallet) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Wallet already exists for this user'
    )
  }

  const wallet = await Wallet.create({
    user: userId,
    type,
  })

  return wallet
}

// Get wallet by user ID
const getWalletByUserId = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId })
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found')
  }
  return wallet
}

// Get all wallets
const getAllWallets = async () => {
  const wallets = await Wallet.find().populate('user')
  if (!wallets) {
    throw new AppError(httpStatus.NOT_FOUND, 'Wallets not found')
  }
  return wallets
}

// Top-Up by user
const topUp = async (userId: string, amount: number) => {
  const wallet = await Wallet.findOne({ user: userId })

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found')
  }

  wallet.balance += amount

  await wallet.save()

  await Transaction.create({
    amount,
    type: TransactionType.top_up,
    from: null,
    to: userId,
    status: TransactionStatus.completed,
  })
}

// Withdraw by user
const withdraw = async (userId: string, amount: number) => {
  const wallet = await Wallet.findOne({ user: userId })
  if (!wallet) throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found')

  if (wallet.balance < amount) throw new AppError(400, 'Insufficient balance')

  wallet.balance -= amount
  await wallet.save()

  await Transaction.create({
    amount,
    type: TransactionType.withdraw,
    from: userId,
    to: null,
    status: TransactionStatus.completed,
  })
}

// Cash in by Agent (decrease balance)
const cashIn = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  reference: string | null = null
) => {
  const session = await Wallet.startSession()
  session.startTransaction()

  let moneyTransaction

  try {
    // fromWallet => Agent's wallet
    const fromWallet = await Wallet.findOne({ user: fromUserId }).session(
      session
    )
    if (!fromWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender's wallet not found")
    }

    if (fromWallet.balance - amount < 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance')
    }

    // toWallet => User's Wallet
    const toWallet = await Wallet.findOne({ user: toUserId }).session(session)

    if (!toWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver's wallet not found")
    }

    fromWallet.balance -= amount
    toWallet.balance += amount

    await fromWallet.save({ session })
    await toWallet.save({ session })

    const moneyTransactionDetails: ITransaction = {
      amount,
      type: TransactionType.cash_in,
      from: fromUserId,
      to: toUserId,
      status: TransactionStatus.pending,
    }

    if (reference) moneyTransactionDetails.reference = reference

    moneyTransaction = await Transaction.create(moneyTransactionDetails)

    await session.commitTransaction()
    session.endSession()

    moneyTransaction.status = TransactionStatus.completed
    await moneyTransaction.save()

    return { fromWallet, toWallet }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    if (moneyTransaction) {
      moneyTransaction.status = TransactionStatus.reversed
      await moneyTransaction.save()
    }

    throw error
  }
}

// Cash out by Agent (increase balance)
const cashOut = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  reference: string | null
) => {
  const session = await Wallet.startSession()
  session.startTransaction()

  let moneyTransaction

  try {
    // fromWallet => User's wallet
    const fromWallet = await Wallet.findOne({ user: fromUserId }).session(
      session
    )
    if (!fromWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender's wallet not found")
    }

    // toWallet => Agent's wallet
    const toWallet = await Wallet.findOne({ user: toUserId }).session(session)
    if (!toWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver's wallet not found")
    }

    if (fromWallet.balance - amount < 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance')
    }

    fromWallet.balance -= amount
    toWallet.balance += amount

    await fromWallet.save({ session })
    await toWallet.save({ session })

    const moneyTransactionDetails: ITransaction = {
      amount,
      type: TransactionType.cash_out,
      from: fromUserId,
      to: toUserId,
      status: TransactionStatus.pending,
    }

    if (reference) moneyTransactionDetails.reference = reference

    moneyTransaction = await Transaction.create(moneyTransactionDetails)

    await session.commitTransaction()
    session.endSession()

    moneyTransaction.status = TransactionStatus.completed
    await moneyTransaction.save()

    return { fromWallet, toWallet }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    if (moneyTransaction) {
      moneyTransaction.status = TransactionStatus.reversed
      await moneyTransaction.save()
    }

    throw error
  }
}

// Transfer money between two wallets (user to user)
const sendMoney = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  reference: string | null
) => {
  const session = await Wallet.startSession()
  session.startTransaction()

  let moneyTransaction

  try {
    const fromWallet = await Wallet.findOne({ user: fromUserId }).session(
      session
    )
    const toWallet = await Wallet.findOne({ user: toUserId }).session(session)

    if (!fromWallet || !toWallet) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Wallet not found for one or both users'
      )
    }

    if (fromWallet.balance < amount) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance')
    }

    fromWallet.balance -= amount
    toWallet.balance += amount

    await fromWallet.save({ session })
    await toWallet.save({ session })

    const moneyTransactionDetails: ITransaction = {
      amount,
      type: TransactionType.send_money,
      from: fromUserId,
      to: toUserId,
      status: TransactionStatus.pending,
    }

    if (reference) moneyTransactionDetails.reference = reference

    moneyTransaction = await Transaction.create(moneyTransactionDetails)

    await session.commitTransaction()
    session.endSession()

    moneyTransaction.status = TransactionStatus.completed
    await moneyTransaction.save()

    return { fromWallet, toWallet }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    if (moneyTransaction) {
      moneyTransaction.status = TransactionStatus.reversed
      await moneyTransaction.save()
    }

    throw error
  }
}

export const WalletServices = {
  createWallet,
  getWalletByUserId,
  getAllWallets,
  topUp,
  withdraw,
  cashIn,
  cashOut,
  sendMoney,
}
