export const errorHandler = (error, request, reply) => {
  // 记录错误日志
  request.log.error(error)

  // 如果已经有状态码，直接抛出（这是sensible或其他插件设置的错误）
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.name || 'Error',
      message: error.message,
      statusCode: error.statusCode
    })
  }

  // Prisma 错误处理
  if (error.code) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return reply.status(409).send({
          error: 'Conflict',
          message: 'Resource already exists',
          statusCode: 409
        })
      
      case 'P2025': // Record not found
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Resource not found',
          statusCode: 404
        })
      
      case 'P2000': // Value out of range
      case 'P2001': // Record does not exist
      case 'P2003': // Foreign key constraint
      case 'P2004': // Constraint violation
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid data provided',
          statusCode: 400
        })
      
      default:
        // 其他 Prisma 错误
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Database operation failed',
          statusCode: 500
        })
    }
  }

  // MinIO 错误处理
  if (error.name === 'S3Error' || error.code === 'NoSuchKey') {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'File not found',
      statusCode: 404
    })
  }

  if (error.name === 'InvalidBucketName' || error.name === 'BucketAlreadyExists') {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Invalid storage operation',
      statusCode: 400
    })
  }

  // 验证错误（来自 Fastify schema 验证）
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.validation,
      statusCode: 400
    })
  }

  // 文件大小超限（来自 multipart）
  if (error.code === 'FST_FILES_LIMIT' || error.code === 'FST_FILE_SIZE_LIMIT') {
    return reply.status(413).send({
      error: 'Payload Too Large',
      message: 'File size exceeds limit',
      statusCode: 413
    })
  }

  // 默认的服务器内部错误
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500
  })
}

export default errorHandler