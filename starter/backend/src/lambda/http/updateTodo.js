import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { getUserId } from '../utils.mjs'
import dynamoDbClient from '../../utils/dbClient.mjs'

const tableName = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    console.log('Processing event: ', event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const updatingTodo = JSON.parse(event.body)
    await updateTodo(todoId, userId, updatingTodo)

    return { statusCode: 200 }
  })

async function updateTodo(todoId, userId, todo) {
  const { name, dueDate, done } = todo

  await dynamoDbClient.update({
    TableName: tableName,
    Key: {
      todoId,
      userId
    },
    UpdateExpression:
      'set #todo_name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      '#todo_name': 'name'
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':dueDate': dueDate,
      ':done': done
    }
  })
}
