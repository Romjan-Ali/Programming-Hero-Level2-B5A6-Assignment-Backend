import express from 'express'
import { WalletControllers } from './wallet.controller'
import { checkAuth } from '../../middlewares/checkAuth'
import { validateRequest } from '../../middlewares/validateRequest'
import {
  createWalletZodValidation,
  topUpWalletZodValidation,
  updateWalletZodValidation,
} from './wallet.validation'
import { Role } from '../user/user.interface'
import { checkAnotherUserRole } from '../../middlewares/checkAnotherUserRole'

const router = express.Router()

/* router.post(
  '/',
  validateRequest(createWalletZodValidation),
  checkAuth(Role.USER),
  WalletControllers.createWallet
)

router.get('/', WalletControllers.getAllWallets)
*/

router.get(
  '/me',
  checkAuth(Role.USER, Role.AGENT),
  WalletControllers.getWalletByUserId
) 

router.post(
  '/top-up',
  validateRequest(topUpWalletZodValidation),
  checkAuth(Role.USER),
  WalletControllers.topUp
)

router.post(
  '/withdraw',
  validateRequest(topUpWalletZodValidation),
  checkAuth(Role.USER),
  WalletControllers.withdraw
)

router.post(
  '/send-money',
  validateRequest(updateWalletZodValidation),
  checkAuth(Role.USER),
  checkAnotherUserRole(Role.USER),
  WalletControllers.sendMoney
)

router.patch(
  '/cash-in',
  validateRequest(updateWalletZodValidation),
  checkAuth(Role.AGENT),
  checkAnotherUserRole(Role.USER),
  WalletControllers.cashIn
)

router.patch(
  '/cash-out',
  validateRequest(updateWalletZodValidation),
  checkAuth(Role.AGENT),
  checkAnotherUserRole(Role.USER),
  WalletControllers.cashOut
)

export const WalletRoutes = router
