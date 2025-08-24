import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/auth/auth.route'
import { WalletRoutes } from '../modules/wallet/wallet.route'
import { TransactionRoutes } from '../modules/transaction/transaction.route'
import { AdminRoutes } from '../modules/admin/admin.route'
import { OtpRoutes } from '../modules/otp/otp.route'

export const router = Router()

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/wallet',
    route: WalletRoutes,
  },
  {
    path: '/transaction',
    route: TransactionRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/otp',
    route: OtpRoutes,
  },
]

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route)
})
