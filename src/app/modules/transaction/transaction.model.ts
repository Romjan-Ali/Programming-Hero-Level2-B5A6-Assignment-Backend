import { Schema, model } from 'mongoose'
import {
  type ITransaction,
  TransactionType,
  TransactionStatus,
} from './transaction.interface'

const transactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    from: {
      type: String,
      ref: 'User'
      // required: true,
    },
    to: {
      type: String,
      ref: 'User'
      // required: true,
    },
    reference: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.pending,
    },
  },
  {
    timestamps: true,
  }
)

export const Transaction = model<ITransaction>('Transaction', transactionSchema)
