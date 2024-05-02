import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import dynamoDbClient from '../../utils/dbClient.mjs'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const tableName = process.env.TODOS_TABLE
const logger = createLogger('deleteTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    logger.info('Processing event: ', event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info(`Deleting todo: ${todoId} of user: ${userId}`)

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
