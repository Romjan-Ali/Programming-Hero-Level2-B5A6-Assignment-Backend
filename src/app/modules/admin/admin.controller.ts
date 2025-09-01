import type { Request, Response } from 'express'
import httpStatus from '../../utils/httpStatus'
import { catchAsync } from '../../utils/catchAsync'
import { sendResponse } from '../../utils/sendResponse'
import { AdminServices } from './admin.service'
import type { JwtPayload } from 'jsonwebtoken'

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers()
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All users retrieved successfully',
    data: result,
  })
})

const getAllAgents = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllAgents()
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All agents retrieved successfully',
    data: result,
  })
})

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await AdminServices.getAllWallets(
    query as Record<string, string>
  )
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All wallets retrieved successfully',
    data: result?.data,
    meta: result?.meta,
  })
})

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await AdminServices.getAllTransactions(
    query as Record<string, string>
  )
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All transactions retrieved successfully',
    data: result?.data,
    meta: result?.meta,
  })
})

const toggleWalletStatus = catchAsync(async (req: Request, res: Response) => {
  const { walletId } = req.params
  const { status } = req.body // boolean

  const result = await AdminServices.toggleWalletStatus(walletId, status)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Wallet ${status ? 'activated' : 'deactivated'} successfully`,
    data: result,
  })
})

const approveOrSuspendAgent = catchAsync(
  async (req: Request, res: Response) => {
    const { agentId } = req.params

    const result = await AdminServices.approveOrSuspendAgent(agentId)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Agent status changed successfully`,
      data: result,
    })
  }
)

const editProfile = catchAsync(async (req: Request, res: Response) => {
  const  user = req.user as JwtPayload
  const updatedData = req.body

  const result = await AdminServices.editProfile(
    user as Record<string, any>,
    updatedData as Record<string, any>
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Profile updated successfully`,
    data: result,
  })
})

export const AdminControllers = {
  getAllUsers,
  getAllAgents,
  getAllWallets,
  getAllTransactions,
  toggleWalletStatus,
  approveOrSuspendAgent,
  editProfile,
}
