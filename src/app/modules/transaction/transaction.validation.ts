import { z } from 'zod'
import { TransactionStatus, TransactionType } from './transaction.interface'

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().min(0),
    type: z.enum(TransactionType),
    from: z.string().min(1),
    to: z.string().min(1),
    reference: z.string().optional(),
    status: z.enum(TransactionStatus).optional(), // default will be applied by DB
  }),
})

export const updateTransactionStatusSchema = z.object({
  body: z.object({
    status: z.enum(TransactionStatus),
  }),
})
