import {
  uploadFile,
  getFileUrl,
  deleteFile,
  listFiles
} from '../lib/storage.js'

const fileSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    originalName: { type: 'string' },
    objectName: { type: 'string' },
    bucketName: { type: 'string' },
    size: { type: 'number' },
    mimetype: { type: 'string' },
    uploadedAt: { type: 'string', format: 'date-time' },
    userId: { type: 'string' }
  }
}

export default async function fileRoutes(fastify) {
  // POST /files - 上传文件
  fastify.post(
    '/',
    {
      schema: {
        response: {
          201: fileSchema
        }
      }
    },
    async (request, reply) => {
      const data = await request.file()
      fastify.assert(data, 400, 'No file uploaded')

      // 上传文件到MinIO
      const bucketName = 'documents'
      const uploadResult = await uploadFile(bucketName, {
        filename: data.filename,
        file: data.file,
        size: data.file.bytesRead || 0,
        mimetype: data.mimetype
      })

      reply.code(201)
      return uploadResult
    }
  )

  // GET /files/:id - 获取文件下载URL
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
          200: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              expiresIn: { type: 'number' }
            }
          }
        }
      }
    },
    async (request) => {
      const { id } = request.params

      // 临时实现：假设objectName就是id + 扩展名
      const bucketName = 'documents'
      const objectName = id // 实际应该从数据库获取

      const url = await getFileUrl(bucketName, objectName, 3600) // 1小时过期
      fastify.assert(url, 404, 'File not found')

      return {
        url,
        expiresIn: 3600
      }
    }
  )

  // GET /files - 列出文件
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                size: { type: 'number' },
                lastModified: { type: 'string', format: 'date-time' },
                etag: { type: 'string' }
              }
            }
          }
        }
      }
    },
    async () => {
      const bucketName = 'documents'
      const files = await listFiles(bucketName)
      fastify.assert(files, 500, 'Failed to retrieve file list')

      return files.map((file) => ({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        etag: file.etag
      }))
    }
  )

  // DELETE /files/:id - 删除文件
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

      // 这里需要从数据库获取文件信息
      // const fileRecord = await prisma.file.findUnique({ where: { id } })
      // fastify.assert(fileRecord, 404, 'File not found')

      const bucketName = 'documents'
      const objectName = id // 实际应该从数据库获取

      await deleteFile(bucketName, objectName)

      // 从数据库删除记录
      // await prisma.file.delete({ where: { id } })

      reply.code(204)
      return null
    }
  )
}
