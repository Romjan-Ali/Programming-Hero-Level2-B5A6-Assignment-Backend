import type { NextFunction, Request, Response } from 'express'
import httpStatus from '../../utils/httpStatus'
import { catchAsync } from '../../utils/catchAsync'
import { sendResponse } from '../../utils/sendResponse'
import { WalletServices } from './wallet.service'
import type { JwtPayload } from 'jsonwebtoken'
import AppError from '../../errorHelpers/AppError'

const createWallet = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload
  const { role } = req.body

  const result = await WalletServices.createWallet(userId, role)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Wallet created successfully',
    data: result,
  })
})

const getWalletByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload // assuming decoded user is attached via auth middleware

  const result = await WalletServices.getWalletByUserId(userId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet retrieved successfully',
    data: result,
  })
})

const topUp = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized request')
  }
  const amount: number = req.body.amount

  const result = await WalletServices.topUp(userId, amount)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Top-up successful',
    data: result,
  })
})

const withdraw = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized request')
  }
  const amount: number = req.body.amount

  const result = await WalletServices.withdraw(userId, amount)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Withdraw successful',
    data: result,
  })
})

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const { userId: fromUserId } = req.user as JwtPayload

  if (!fromUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized request')
  }

  const toUserId: string = req.body.toUserId
  const amount: number = req.body.amount
  const reference: string = req.body.reference || null

  console.log({ toUserId })

  const result = await WalletServices.cashIn(
    fromUserId,
    toUserId,
    amount,
    reference
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet cash in successfully',
    data: result,
  })
})

const cashOut = catchAsync(async (req: Request, res: Response) => {
  const { userId: fromUserId } = req.user as JwtPayload

  if (!fromUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized request')
  }

  const toUserId: string = req.body.toUserId
  const amount: number = req.body.amount
  const reference: string = req.body.reference || null

  const result = await WalletServices.cashOut(
    fromUserId,
    toUserId,
    amount,
    reference
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet cash out successfully',
    data: result,
  })
})

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletServices.getAllWallets()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All wallets retrieved successfully',
    data: result,
  })
})

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const fromUserId = (req.user as JwtPayload)?.userId
  const toUserId: string = req.body.toUserId
  const amount: number = req.body.amount
  const reference: string = req.body.reference || null

  const result = await WalletServices.sendMoney(
    fromUserId,
    toUserId,
    amount,
    reference
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Balance transfered successfully',
    data: result,
  })
})

export const WalletControllers = {
  createWallet,
  getWalletByUserId,
  topUp,
  withdraw,
  cashIn,
  cashOut,
  getAllWallets,
  sendMoney,
}
