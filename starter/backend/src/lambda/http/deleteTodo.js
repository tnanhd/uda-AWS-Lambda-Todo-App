import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { parseUserId } from '../../auth/utils.mjs'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())

const tableName = process.env.TODOS_TABLE

export async function handler(event) {
  console.log('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const userId = parseUserId(split[1])

  await dynamoDbClient.delete({
    TableName: tableName,
    Key: {
      todoId,
      userId
    }
  })

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
