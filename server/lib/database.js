import { PrismaClient } from '@prisma/client'

let prismaClient = null

export const getPrismaClient = () => {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  }
  return prismaClient
}

export const closePrismaClient = async () => {
  if (prismaClient) {
    await prismaClient.$disconnect()
    prismaClient = null
  }
}

export default getPrismaClient