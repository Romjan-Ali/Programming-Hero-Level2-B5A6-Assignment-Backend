import { model, Schema } from 'mongoose'
import {
  type IAuthProvider,
  type IUser,
  IsActive,
  Role,
} from './user.interface'

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    versionKey: false,
    _id: false,
  }
)

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isApproved: {
      type: Boolean
    },
    isVerified: { type: Boolean, default: true },
    auths: [authProviderSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Exclude documents with isDeleted: true in all queries

userSchema.pre('find', function () {
  this.where({ isDeleted: false })
})

userSchema.pre('findOne', function () {
  this.where({ isDeleted: false })
})

userSchema.pre('findOneAndUpdate', function () {
  this.where({ isDeleted: false })
})

userSchema.pre('findOneAndUpdate', function () {
  this.where({ isDeleted: false })
})

userSchema.pre('updateOne', function () {
  this.where({ isDeleted: false })
})

userSchema.pre('updateMany', function () {
  this.where({ isDeleted: false })
})

export const User = model<IUser>('User', userSchema)
