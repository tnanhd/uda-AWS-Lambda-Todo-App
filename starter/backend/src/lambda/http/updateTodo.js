import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { parseUserId } from '../../auth/utils.mjs'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())

const tableName = process.env.TODOS_TABLE

export async function handler(event) {
  console.log('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const updatedTodo = JSON.parse(event.body)
  const { name, dueDate, done } = updatedTodo

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const userId = parseUserId(split[1])

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

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
