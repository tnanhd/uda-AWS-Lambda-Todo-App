import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { parseUserId } from '../../auth/utils.mjs'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
const s3Client = new S3Client()

const tableName = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export async function handler(event) {
  console.log('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const userId = parseUserId(split[1])

  const url = await getUploadUrl(todoId)

  await updateAttachmentUrl(todoId, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ uploadUrl: url })
  }
}

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

async function updateAttachmentUrl(todoId, userId) {
  await dynamoDbClient.update({
    TableName: tableName,
    Key: {
      todoId,
      userId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }
  })
}
