import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { deleteTodo } from '../../businessLogic/todos.mjs'

const logger = createLogger('deleteTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    logger.info('Processing event:')
    logger.info(event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    await deleteTodo(userId, todoId)

    return {
      statusCode: 204
    }
  })
