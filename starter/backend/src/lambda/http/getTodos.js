import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const tableName = process.env.TODOS_TABLE

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const logger = createLogger('getTodos')

export async function handler(event) {
  console.log('Processing event: ', event)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const userId = parseUserId(split[1])
  logger.info(`userId: ${userId}`)

  const todos = await dynamoDbDocument.query({
    TableName: tableName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ items: todos.Items })
  }
}
