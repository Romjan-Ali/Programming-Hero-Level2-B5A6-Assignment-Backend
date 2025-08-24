import type { Request, Response } from 'express'
import httpStatus from '../../utils/httpStatus'
import { catchAsync } from '../../utils/catchAsync'
import { sendResponse } from '../../utils/sendResponse'
import { AdminServices } from './admin.service'

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

const getAllWallets = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllWallets()
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All wallets retrieved successfully',
    data: result,
  })
})

const getAllTransactions = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllTransactions()
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All transactions retrieved successfully',
    data: result,
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
    const { status } = req.body // boolean

    const result = await AdminServices.approveOrSuspendAgent(agentId, status)
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Agent has been ${
        status ? 'approved' : 'suspended'
      } successfully`,
      data: result,
    })
  }
)

export const AdminControllers = {
  getAllUsers,
  getAllAgents,
  getAllWallets,
  getAllTransactions,
  toggleWalletStatus,
  approveOrSuspendAgent,
}
