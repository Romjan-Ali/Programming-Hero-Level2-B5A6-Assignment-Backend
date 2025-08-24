import type { Types } from "mongoose"
import type { Role } from "../user/user.interface"

export interface IWallet {
  user: Types.ObjectId
  balance: number
  type: Role.USER | Role.AGENT
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}
