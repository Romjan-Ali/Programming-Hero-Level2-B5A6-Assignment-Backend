// src/server.ts
import app from './app'
import { envVars } from './app/config/env'
import connectMongoDB from './app/db/connectMongoDB'
import { Server } from 'http'
import { seedAdmin } from './app/utils/seedSuperAdmin';
import { connectRedis } from './app/config/redis.config';

let server: Server

;(async () => {
  await connectMongoDB()
})().then(() => {
  server = app.listen(envVars.PORT, async () => {
    console.log(`Server is listening to port ${envVars.PORT}`)
  })
})

;(async () => {
  await seedAdmin()
  await connectRedis()
})()

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received... Server shutting down..')
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received... Server shutting down..')
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

process.on('unhandledRejection', () => {
  console.log('Unhandled Rejection signal received... Server shutting down..')
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

process.on('uncaughtException', () => {
  console.log('Uncaught Exception signal received... Server shutting down..')
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

// Unhandler rejection error
// Promise.reject(new Error("I forgot to catch this promise"))

// Uncaught Exception Error
// throw new Error("I forgot to handle this local error")
