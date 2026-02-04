import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getTodos } from '../../business/businessTodos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// Name of a service
const serviceName = `${process.env.SERVICE_NAME}-GetTodos`;

// CloudWatch client
const cloudwatch = new CloudWatchClient();

//logger
const logger = createLogger('getTodos')

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

    logger.info(`Getting Todos method ${JSON.stringify(event, null, 2)}`)

    const userId = getUserId(event)
    const todos = await getTodos(userId)
    logger.info('Getted items!: ', todos)

    endTime = timeInMs()

    const totalTime = endTime - startTime

    await sendMetrics(totalTime)


    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
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