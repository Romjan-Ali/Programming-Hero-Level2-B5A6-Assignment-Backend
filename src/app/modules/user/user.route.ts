// src/app/modules/user/user.route.ts
import { Router } from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import { validateRequest } from '../../middlewares/validateRequest'
import { UserControllers } from './user.controller'
import { Role } from './user.interface'
import { createUserZodSchema, updateUserZodSchema } from './user.validation'

const router = Router()

router.post(
  '/register',
  validateRequest(createUserZodSchema),
  UserControllers.createUser
)

router.get('/all-users', checkAuth(Role.ADMIN), UserControllers.getAllUsers)

router.get('/me', checkAuth(...Object.values(Role)), UserControllers.getMe)

router.get('/:id', checkAuth(Role.ADMIN), UserControllers.getSingleUser)

router.patch(
  '/edit-profile',
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser
)

router.patch('/users/:userId/status', UserControllers.changeUserStatus)

export const UserRoutes = router
