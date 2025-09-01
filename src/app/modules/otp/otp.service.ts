import crypto from 'crypto'
import { redisClient } from '../../config/redis.config'
import AppError from '../../errorHelpers/AppError'
import { sendEmail } from '../../utils/sendEmail'
import { User } from '../user/user.model'
const OTP_EXPIRATION = 5 * 60 // 5 minute

const generateOtp = (length = 6) => {
  //6 digit otp
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

  // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000

  return otp
}

const sendOTP = async (email: string, name: string = 'User') => {
  /*   const user = await User.findOne({ email })

  console.log({ email, name })

  if (!user) {
    throw new AppError(404, 'User not found')
  }

  if (user.isVerified) {
    throw new AppError(401, 'You are already verified')
  } */

  console.log({ email, name })

  const otp = generateOtp()

  const redisKey = `otp:${email}`

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: 'EX',
      value: OTP_EXPIRATION,
    },
  })

  await sendEmail({
    to: email,
    subject: 'Your OTP Code',
    templateName: 'otp',
    templateData: { name, otp },
  })
}

const verifyOTP = async (email: string, otp: string) => {
  // const user = await User.findOne({ email, isVerified: false })
  const user = await User.findOne({ email })

  /* if (!user) {
    throw new AppError(404, 'User not found')
  } */

  if (user && user.isVerified) {
    throw new AppError(401, `User with the email ${email} is already exists`)
  }

  const redisKey = `otp:${email}`

  const savedOtp = await redisClient.get(redisKey)

  if (!savedOtp) {
    throw new AppError(401, 'Invalid OTP')
  }

  if (savedOtp !== otp) {
    throw new AppError(401, 'Invalid OTP')
  }

  if (user) {
    await User.updateOne(
      { email },
      { isVerified: true },
      { runValidators: true }
    )
  }

  redisClient.del([redisKey])
}

export const OTPService = {
  sendOTP,
  verifyOTP,
}
