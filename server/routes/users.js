import { getPrismaClient } from '../lib/database.js'

const prisma = getPrismaClient()

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    password: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

const createUserSchema = {
  type: 'object',
  required: ['email', 'name', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    password: { type: 'string' }
  }
}

const updateUserSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    password: { type: 'string' }
  }
}

export default async function userRoutes(fastify) {
  // GET /users
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: userSchema
          }
        }
      }
    },
    async () => {
      const users = await prisma.user.findMany()
      fastify.assert(users, 500, 'Failed to fetch users')
      return users
    }
  )

  // GET /users/:id
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        response: {
          200: userSchema
        }
      }
    },
    async (request) => {
      const { id } = request.params
      const user = await prisma.user.findUnique({
        where: { id }
      })

      fastify.assert(user, 404, 'User not found')
      return user
    }
  )

  // POST /users
  fastify.post(
    '/',
    {
      schema: {
        body: createUserSchema,
        response: {
          201: userSchema
        }
      }
    },
    async (request, reply) => {
      const { email, name, password } = request.body
      const user = await prisma.user.create({
        data: { email, name, password }
      })

      reply.code(201)
      return user
    }
  )

  // PUT /users/:id
  fastify.put(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        body: updateUserSchema,
        response: {
          200: userSchema
        }
      }
    },
    async (request) => {
      const { id } = request.params
      const data = request.body

      const user = await prisma.user.update({
        where: { id },
        data
      })

      return user
    }
  )

  // DELETE /users/:id
  fastify.delete(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        response: {
          204: { type: 'null' }
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params

      await prisma.user.delete({
        where: { id }
      })

      reply.code(204)
      return null
    }
  )
}
