import { v4 as uuidv4 } from 'uuid'
import { parseUserId } from '../../auth/utils.mjs'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { createLogger } from '../../utils/logger.mjs'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())

const tableName = process.env.TODOS_TABLE

const logger = createLogger('createTodo')

export async function handler(event) {
  console.log('Processing event: ', event)

  const parsedBody = JSON.parse(event.body)
  const todoId = uuidv4()

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const userId = parseUserId(split[1])
  logger.info(`userId: ${userId}`)

  const newTodo = {
    todoId,
    userId,
    done: false,
    attachmentUrl: '',
    ...parsedBody
  }

  await dynamoDbClient.put({
    TableName: tableName,
    Item: newTodo
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ item: newTodo })
  }
}
