import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import dynamoDbClient from '../../utils/dbClient.mjs'

const tableName = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    console.log('Processing event: ', event)

    const userId = getUserId(event)
    const items = await getTodosByUserId(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ items })
    }
  })

async function getTodosByUserId(userId) {
  const todos = await dynamoDbClient.query({
    TableName: tableName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  })
  return todos.Items
}
