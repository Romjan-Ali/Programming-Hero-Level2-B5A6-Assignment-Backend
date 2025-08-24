import type { Request, Response, NextFunction } from 'express'
import httpStatus from '../utils/httpStatus'
import AppError from '../errorHelpers/AppError'
import { User } from '../modules/user/user.model'
import { Role } from '../modules/user/user.interface'

export const checkAnotherUserRole =
  (...allowedRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { toUserId } = req.body

      if (!toUserId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'toUserId is required')
      }

      const toUser = await User.findById(toUserId)

      if (!toUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'Receiver user not found')
      }

      console.log({ toUser })

      if (!allowedRoles.includes(toUser.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `Receiver is not authorized as ${allowedRoles.join(', ')}`
        )
      }

      next()
    } catch (error) {
      console.log('Error in checkToUserRole', error)
      next(error)
    }
  }
