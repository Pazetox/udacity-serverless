import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { update } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// Name of a service
const serviceName = `${process.env.SERVICE_NAME}-Update`;

// CloudWatch client
const cloudwatch = new CloudWatchClient();

//logger
const logger = createLogger('updateTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const startTime = timeInMs()
    let endTime

    logger.info('Update todo event: ', event)

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const todoNewInfo = JSON.parse(event.body)
    const updatedTodo = await update(todoNewInfo, todoId, userId)
    
    logger.info('Updated item! : ', updatedTodo)
    
    endTime = timeInMs()
    
    const totalTime = endTime - startTime

    await sendMetrics(totalTime)

    return {
      statusCode: 200
    }
  })

  async function sendMetrics(totalTime) {
      const latencyMetricCommand = new PutMetricDataCommand({
        MetricData: [
          {
            MetricName: 'Latency',
            Dimensions: [
              {
                Name: 'ServiceName',
                Value: serviceName
              }
            ],
            Unit: 'Milliseconds',
            Value: totalTime
          }
        ],
        Namespace: 'Udacity/Serverless'
      })
      await cloudwatch.send(latencyMetricCommand)
    }