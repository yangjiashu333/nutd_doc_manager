import * as Minio from 'minio'
import crypto from 'crypto'
import path from 'path'

let minioClient = null

const getMinioClient = () => {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    })
  }
  return minioClient
}

export const createBucketIfNotExists = async (bucketName) => {
  const client = getMinioClient()
  const exists = await client.bucketExists(bucketName)
  if (!exists) {
    await client.makeBucket(bucketName)
  }
}

export const uploadFile = async (bucketName, file, metadata = {}) => {
  const client = getMinioClient()
  await createBucketIfNotExists(bucketName)
  
  const fileId = crypto.randomUUID()
  const ext = path.extname(file.filename || '')
  const objectName = `${fileId}${ext}`
  
  const uploadInfo = await client.putObject(bucketName, objectName, file.file, file.size, {
    'Content-Type': file.mimetype,
    ...metadata
  })
  
  return {
    id: fileId,
    objectName,
    bucketName,
    originalName: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    etag: uploadInfo.etag,
    uploadedAt: new Date()
  }
}

export const getFileUrl = async (bucketName, objectName, expiry = 7 * 24 * 60 * 60) => {
  const client = getMinioClient()
  return await client.presignedGetObject(bucketName, objectName, expiry)
}

export const downloadFile = async (bucketName, objectName) => {
  const client = getMinioClient()
  return await client.getObject(bucketName, objectName)
}

export const deleteFile = async (bucketName, objectName) => {
  const client = getMinioClient()
  await client.removeObject(bucketName, objectName)
}

export const getFileInfo = async (bucketName, objectName) => {
  const client = getMinioClient()
  return await client.statObject(bucketName, objectName)
}

export const listFiles = async (bucketName, prefix = '', recursive = true) => {
  const client = getMinioClient()
  const objects = []
  
  return new Promise((resolve, reject) => {
    const stream = client.listObjects(bucketName, prefix, recursive)
    
    stream.on('data', (obj) => {
      objects.push(obj)
    })
    
    stream.on('error', (err) => {
      reject(err)
    })
    
    stream.on('end', () => {
      resolve(objects)
    })
  })
}

export default {
  getMinioClient,
  createBucketIfNotExists,
  uploadFile,
  getFileUrl,
  downloadFile,
  deleteFile,
  getFileInfo,
  listFiles
}