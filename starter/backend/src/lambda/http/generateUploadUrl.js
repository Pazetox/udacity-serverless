import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { generateImageUrl } from '../../fileStorage/attachmentUtils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// Name of a service
const serviceName = `${process.env.SERVICE_NAME}-GenerateUploadURL`;

// CloudWatch client
const cloudwatch = new CloudWatchClient();

//logger
const logger = createLogger('generateUploadUrl')

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

    logger.info('Generating upload url event: ', event)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const uploadUrl = await generateImageUrl(todoId, userId)
    logger.info('Generate image successfully: ', uploadUrl)

    endTime = timeInMs()

    const totalTime = endTime - startTime

    await sendMetrics(totalTime)


    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl
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