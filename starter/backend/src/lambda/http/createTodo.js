
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { create } from '../../business/businessTodos.mjs'
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// Name of a service
const serviceName = `process.env.SERVICE_NAME${'-Create'}`

// CloudWatch client
const cloudwatch = new CloudWatchClient();

//logger
const logger = createLogger('httpCreate')

//handler, middleware, cors, metrics, logger
export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async (event) => {
    const startTime = timeInMs()
    let endTime


    logger.info(`Sending createTodo method ${JSON.stringify(event, null, 2)}`)

    const newTodo = JSON.parse(event.body)

    const userId = getUserId(event)

    const item = await create(newTodo, userId)

    logger.info(`Item created ${JSON.stringify(item, null, 2)}`)

    endTime = timeInMs()

    const totalTime = endTime - startTime

    await sendMetrics(totalTime)

    return getresponse(item)
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
    Namespace: 'Udacity/Serveless'
  })
  await cloudwatch.send(latencyMetricCommand)
}

function getresponse(item) {
  return {
    statusCode: 201, body: JSON.stringify({
      item
    })
  }
}

function timeInMs() {
  return new Date().getTime()
}
