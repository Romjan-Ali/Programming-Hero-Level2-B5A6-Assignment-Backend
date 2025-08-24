import { z } from 'zod'

export const toggleWalletStatusZod = z.object({
  params: z.object({
    walletId: z.string().min(1),
  }),
  body: z.object({
    status: z.boolean(),
  }),
})

export const approveAgentZod = z.object({
  params: z.object({
    agentId: z.string().min(1),
  }),
  body: z.object({
    status: z.boolean(),
  }),
})

export const getAllEntitiesZod = z.object({
  query: z.object({}).optional(),
})
