import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId, timeInMs } from '../utils.mjs'
import dynamoDbClient from '../../utils/dbClient.mjs'
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import cloudwatch from '../../utils/cloudwatchClient.mjs'
import { createLogger } from '../../utils/logger.mjs'

const tableName = process.env.TODOS_TABLE
const serviceName = process.env.SERVICE_NAME
const functionName = 'getTodos'
const logger = createLogger('getTodos')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    logger.info('Processing event', { ...event })
    const startTime = timeInMs()
    let endTime
    let requestWasSuccessful

    const userId = getUserId(event)
    let items = []

    try {
      items = await getTodosByUserId(userId)
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
      statusCode: 200,
      body: JSON.stringify({ items })
    }
  })

async function getTodosByUserId(userId) {
  const todos = await dynamoDbClient.query({
    TableName: tableName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  })
  return todos.Items
}
