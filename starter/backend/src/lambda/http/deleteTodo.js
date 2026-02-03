
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { deleteItem } from '../../business/businessTodos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('deleteTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Deleting todo event: ', event)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const todoDeleted = await deleteItem(todoId, userId)
    logger.info('Delete todo successfully: ', todoDeleted)

    return {
      statusCode: 200
    }
  })