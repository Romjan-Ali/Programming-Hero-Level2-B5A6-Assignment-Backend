import type { Request, Response, NextFunction } from 'express'
import httpStatus from '../utils/httpStatus'
import AppError from '../errorHelpers/AppError'
import { User } from '../modules/user/user.model'
import { Role } from '../modules/user/user.interface'

export const checkRecipientUserRole =
  (...allowedRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { recipientIdentifier } = req.body

      if (!recipientIdentifier) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Recipient identifier is required'
        )
      }

      const recipient = await User.findOne({
        $or: [{ email: recipientIdentifier }, { phone: recipientIdentifier }],
      })

      if (!recipient) {
        throw new AppError(httpStatus.NOT_FOUND, 'Receiver user not found')
      }

      console.log({ recipient })

      if (!allowedRoles.includes(recipient.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `Receiver is not authorized as ${allowedRoles.join(', ')}`
        )
      }

      res.locals.recipeint = recipient

      next()
    } catch (error) {
      console.log('Error in checkToUserRole', error)
      next(error)
    }
  }
