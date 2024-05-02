import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createLogger } from '../utils/logger.mjs'

const s3Client = new S3Client()
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const bucketName = process.env.IMAGES_S3_BUCKET
const logger = createLogger('attachmentUtils')

export async function getUploadUrl(key) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key
  })

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })

  logger.info(`Pre-signedUrl: ${url}`)

  return url
}
