import { dynamoDbClient } from '../utils/dbClient.mjs'

export class TodoAccess {
  constructor() {
    this.dbClient = dynamoDbClient
    this.tableName = process.env.TODOS_TABLE
  }

  async getTodosByUserId(userId) {
    const queryResult = await this.dbClient.query({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    return queryResult.Items
  }

  async createTodo(todo) {
    await this.dbClient.put({
      TableName: this.tableName,
      Item: todo
    })
  }

  async deleteTodo(userId, todoId) {
    await this.dbClient.delete({
      TableName: this.tableName,
      Key: { todoId, userId }
    })
  }

  async updateTodo(userId, todoId, todo) {
    const { name, dueDate, done } = todo

    await this.dbClient.update({
      TableName: this.tableName,
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

  async updateAttachmentUrl(userId, todoId, attachmentUrl) {
    await this.dbClient.update({
      TableName: this.tableName,
      Key: { todoId, userId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
  }
}
