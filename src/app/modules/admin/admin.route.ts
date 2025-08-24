import express from 'express'
import { AdminControllers } from './admin.controller'
import { checkAuth } from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = express.Router()

router.use(checkAuth(Role.ADMIN))

router.get('/users', AdminControllers.getAllUsers)
router.get('/agents', AdminControllers.getAllAgents)
router.get('/wallets', AdminControllers.getAllWallets)
router.get('/transactions', AdminControllers.getAllTransactions)

router.patch('/wallets/:walletId/status', AdminControllers.toggleWalletStatus)
router.patch('/agents/:agentId/status', AdminControllers.approveOrSuspendAgent)

export const AdminRoutes = router
