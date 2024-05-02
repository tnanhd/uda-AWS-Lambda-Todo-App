import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { v4 as uuidv4 } from 'uuid'
import { getUserId, timeInMs } from '../utils.mjs'
import dynamoDbClient from '../../utils/dbClient.mjs'
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import cloudwatch from '../../utils/cloudwatchClient.mjs'
import { createLogger } from '../../utils/logger.mjs'

const tableName = process.env.TODOS_TABLE
const serviceName = process.env.SERVICE_NAME
const functionName = 'createTodo'
const logger = createLogger('createTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    logger.info('Processing event: ', event)
    const startTime = timeInMs()
    let endTime
    let requestWasSuccessful

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
    logger.info('Creating todo: ', newTodo)

    try {
      await createTodo(newTodo)
      requestWasSuccessful = true
    } catch (e) {
      requestWasSuccessful = false
    } finally {
      endTime = timeInMs()
    }

    const successMetricCommand = new PutMetricDataCommand({
      MetricData: [
        {
          MetricName: 'Success',
          Dimensions: [
            {
              Name: 'ServiceName',
              Value: serviceName
            }
          ],
          Unit: 'Count',
          Value: requestWasSuccessful ? 1 : 0
        }
      ],
      Namespace: 'Udacity/Serveless'
    })
    await cloudwatch.send(successMetricCommand)

    const deltaTime = endTime - startTime
    logger.info(`Processing time: ${deltaTime}s`)

    const latencyMetricCommand = new PutMetricDataCommand({
      MetricData: [
        {
          MetricName: 'Latency',
          Dimensions: [
            {
              Name: 'FunctionName',
              Value: functionName
            }
          ],
          Unit: 'Milliseconds',
          Value: deltaTime
        }
      ],
      Namespace: 'Udacity/Serveless'
    })
    await cloudwatch.send(latencyMetricCommand)

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
