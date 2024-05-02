import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../utils.mjs'
import dynamoDbClient from '../../utils/dbClient.mjs'

const tableName = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    console.log('Processing event: ', event)

    const parsedBody = JSON.parse(event.body)
    const todoId = uuidv4()
    const userId = getUserId(event)

    const newTodo = {
      todoId,
      userId,
      done: false,
      attachmentUrl: '',
      ...parsedBody
    }

    await createTodo(newTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({ item: newTodo })
    }
  })

async function createTodo(todo) {
  await dynamoDbClient.put({
    TableName: tableName,
    Item: todo
  })
}
