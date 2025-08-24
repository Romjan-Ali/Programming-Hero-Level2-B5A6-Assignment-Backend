import { model, Schema } from 'mongoose'
import { type IWallet } from './wallet.interface'
import { Role } from '../user/user.interface'

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    type: {
      type: String,
      enum: [Role.USER, Role.AGENT],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,      
    }
  },
  {
    timestamps: true,
  }
)

export const Wallet = model<IWallet>('Wallet', walletSchema)