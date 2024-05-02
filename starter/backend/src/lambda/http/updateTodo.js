import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { getUserId } from '../auth/utils.mjs'
import { timeInMs } from '../../utils/time.mjs'
import cloudwatch from '../../utils/cloudwatchClient.mjs'
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import { createLogger } from '../../utils/logger.mjs'
import { updateTodo } from '../../businessLogic/todos.mjs'
const serviceName = process.env.SERVICE_NAME
const functionName = 'updateTodo'
const logger = createLogger('updateTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    logger.info('Processing event:')
    logger.info(event)
    const startTime = timeInMs()
    let endTime
    let requestWasSuccessful

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const updatingTodo = JSON.parse(event.body)
    try {
      await updateTodo(userId, todoId, updatingTodo)
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

    return { statusCode: 200 }
  })
