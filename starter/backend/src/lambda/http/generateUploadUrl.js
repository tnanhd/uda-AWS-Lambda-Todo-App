import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../auth/utils.mjs'
import { updateAttachmentUrl } from '../../businessLogic/todos.mjs'
import { getUploadUrl } from '../../fileStorage/attachmentUtils.mjs'

const logger = createLogger('generateUploadUrl')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    logger.info('Processing event:')
    logger.info(event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const url = await getUploadUrl(todoId)
    await updateAttachmentUrl(userId, todoId)

    return {
      statusCode: 201,
      body: JSON.stringify({ uploadUrl: url })
    }
  })
