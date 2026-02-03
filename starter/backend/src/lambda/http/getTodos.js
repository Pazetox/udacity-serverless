import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getTodos } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('getTodos')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Get todos event: ', event)
    const userId = getUserId(event)
    const todos = await getTodos(userId)
    logger.info('Get todos successfully: ', todos)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })