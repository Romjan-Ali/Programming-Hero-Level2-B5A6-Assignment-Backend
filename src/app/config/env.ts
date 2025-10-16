// src/app/config/env.ts
interface EnvConfig {
  PORT: string
  MONGO_URI: string
  NODE_ENV: string

  JWT_ACCESS_SECRET: string
  JWT_ACCESS_EXPIRES: string
  JWT_REFRESH_SECRET: string
  JWT_REFRESH_EXPIRES: string

  ADMIN_EMAIL: string
  ADMIN_PASSWORD: string

  BCRYPT_SALT_ROUND: string

  FRONTEND_URL: string

  EXPRESS_SESSION_SECRET: string

  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_CALLBACK_URL: string

  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM: string

  REDIS_HOST: string
  REDIS_PORT: string
  REDIS_USERNAME: string
  REDIS_PASSWORD: string
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    'PORT',
    'MONGO_URI',
    'JWT_ACCESS_SECRET',
    'JWT_ACCESS_EXPIRES',
    'JWT_REFRESH_SECRET',
    'NODE_ENV',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'BCRYPT_SALT_ROUND',
    'FRONTEND_URL',
    'EXPRESS_SESSION_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'JWT_REFRESH_EXPIRES',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_USERNAME',
    'REDIS_PASSWORD',
  ]

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`)
    }
  })

  return {
    PORT: process.env.PORT as string,
    MONGO_URI: process.env.MONGO_URI as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    NODE_ENV: process.env.NODE_ENV as string,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_FROM: process.env.SMTP_FROM as string,
    REDIS_HOST: process.env.REDIS_HOST as string,
    REDIS_PORT: process.env.REDIS_PORT as string,
    REDIS_USERNAME: process.env.REDIS_USERNAME as string,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
  }
}

export const envVars = loadEnvVariables()
