import { TodoAccess } from '../dataLayer/todosAccess.mjs'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../utils/logger.mjs'

const todoAccess = new TodoAccess()
const bucketName = process.env.IMAGES_S3_BUCKET
const logger = createLogger('todosBusinessLogic')

export async function getTodosByUserId(userId) {
  logger.info(`Getting all todos by user: ${userId}`)
  return todoAccess.getTodosByUserId(userId)
}

export async function createTodo(userId, createTodoRequest) {
  const todoId = uuidv4()
  const newTodo = {
    todoId,
    userId,
    done: false,
    attachmentUrl: '',
    ...createTodoRequest
  }
  logger.info(`Creating todo for user ${userId}:`)
  logger.info(newTodo)
  await todoAccess.createTodo(newTodo)
  return newTodo
}

export async function deleteTodo(userId, todoId) {
  logger.info(`Deleting todo: ${todoId} from user: ${userId}`)
  await todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(userId, todoId, todo) {
  logger.info(`Updating todo: ${todoId} from user: ${userId}`)
  logger.info('Updating todo object:')
  logger.info(todo)
  todoAccess.updateTodo(userId, todoId, todo)
}

export async function updateAttachmentUrl(userId, todoId) {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  await todoAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}
