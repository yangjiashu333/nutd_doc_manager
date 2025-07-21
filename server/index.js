import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import multipart from '@fastify/multipart'
import userRoutes from './routes/users.js'
import fileRoutes from './routes/files.js'
import { closePrismaClient } from './lib/database.js'
import errorHandler from './lib/error-handler.js'

const fastify = Fastify({ logger: true })

await fastify.register(sensible)
await fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
})

// 注册全局错误处理器
fastify.setErrorHandler(errorHandler)

await fastify.register(userRoutes, { prefix: '/users' })
await fastify.register(fileRoutes, { prefix: '/files' })

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server listening on http://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  await fastify.close()
  await closePrismaClient()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await fastify.close()
  await closePrismaClient()
  process.exit(0)
})

start()
