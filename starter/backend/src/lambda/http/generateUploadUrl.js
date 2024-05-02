import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getUserId } from '../utils.mjs'
import dynamoDbClient from '../../utils/dbClient.mjs'

const s3Client = new S3Client()

const tableName = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    console.log('Processing event: ', event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const url = await getUploadUrl(todoId)

    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    await updateAttachmentUrl(todoId, userId, attachmentUrl)

    return {
      statusCode: 201,
      body: JSON.stringify({ uploadUrl: url })
    }
  })

async function getUploadUrl(key) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  return url
}

async function updateAttachmentUrl(todoId, userId, attachmentUrl) {
  await dynamoDbClient.update({
    TableName: tableName,
    Key: { todoId, userId },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    }
  })
}
