
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { deleteItem } from '../../business/businessTodos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// Name of a service
const serviceName = `${process.env.SERVICE_NAME}-Delete`;


// CloudWatch client
const cloudwatch = new CloudWatchClient();

//logger
const logger = createLogger('deleteTodo')

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

    logger.info(`Deleting deleteTodo method ${JSON.stringify(event, null, 2)}`)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const todoDeleted = await deleteItem(todoId, userId)

    logger.info(`Deleted item!  ${JSON.stringify(event, null, 2)}`)

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


function timeInMs() {
  return new Date().getTime()
}