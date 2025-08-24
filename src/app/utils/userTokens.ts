import { generateToken, verifyToken } from './jwt'
import { IsActive, type IUser } from '../modules/user/user.interface'
import { envVars } from '../config/env'
import type { JwtPayload } from 'jsonwebtoken'
import { User } from '../modules/user/user.model'
import AppError from '../errorHelpers/AppError'
import httpStatus from './httpStatus'

export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  )
  
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  )

  return {
    accessToken,
    refreshToken,
  }
}

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const decodedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload

  const user = await User.findOne({ email: decodedRefreshToken.email })

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist')
  }

  if (
    user.isActive === IsActive.BLOCKED ||
    user.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.isActive}`)
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is deleted')
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  )

  return accessToken
}
