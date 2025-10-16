// src/app/modules/wallet/wallet.route.ts
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
import { checkRecipientUserRole } from '../../middlewares/checkRecipientUserRole'

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
  WalletControllers.getWalletByUser
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
  checkRecipientUserRole(Role.USER),
  WalletControllers.sendMoney
)

router.patch(
  '/cash-in',
  validateRequest(updateWalletZodValidation),
  checkAuth(Role.AGENT),
  checkRecipientUserRole(Role.USER),
  WalletControllers.cashIn
)

router.patch(
  '/cash-out',
  validateRequest(updateWalletZodValidation),
  checkAuth(Role.AGENT),
  checkRecipientUserRole(Role.USER),
  WalletControllers.cashOut
)

export const WalletRoutes = router
