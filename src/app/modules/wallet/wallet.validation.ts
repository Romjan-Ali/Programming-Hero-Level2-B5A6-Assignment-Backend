import { z } from 'zod'

export const createWalletZodValidation = z.object({
  user: z.string().nonempty('User ID is required'),
  balance: z.number().min(0, 'Balance must be a non-negative number'),
  role: z.enum(['USER', 'AGENT']).optional(),
})

export const updateWalletZodValidation = z.object({
  toUserId: z.string().nonempty("Receiver's User ID is required"),
  amount: z.number().min(0, 'Amount must be a non-negative number'),
  reference: z.string().optional()
})

export const topUpWalletZodValidation = z.object({
  amount: z.number().min(0, 'Amount must be a non-negative number')
})