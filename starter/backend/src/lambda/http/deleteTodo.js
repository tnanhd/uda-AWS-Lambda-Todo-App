import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import dynamoDbClient from '../../utils/dbClient.mjs'
import { getUserId } from '../utils.mjs'

const tableName = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    console.log('Processing event: ', event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    await deleteTodo(todoId, userId)

    return {
      statusCode: 204
    }
  })

async function deleteTodo(todoId, userId) {
  await dynamoDbClient.delete({
    TableName: tableName,
    Key: {
      todoId,
      userId
    }
  })
}
