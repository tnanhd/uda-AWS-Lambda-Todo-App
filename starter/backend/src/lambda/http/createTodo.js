import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import { timeInMs } from '../../utils/time.mjs'
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import cloudwatch from '../../utils/cloudwatchClient.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { createTodo } from '../../businessLogic/todos.mjs'

const serviceName = process.env.SERVICE_NAME
const functionName = 'createTodo'
const logger = createLogger('createTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    logger.info('Processing event:')
    logger.info(event)

    const startTime = timeInMs()
    let endTime
    let requestWasSuccessful

    const parsedBody = JSON.parse(event.body)
    const userId = getUserId(event)

    let createdTodo = {}
    try {
      createdTodo = await createTodo(userId, parsedBody)
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
      body: JSON.stringify({ item: createdTodo })
    }
  })
