import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { update } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('updateTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Update todo event: ', event)

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const todoNewInfo = JSON.parse(event.body)
    const updatedTodo = await update(todoNewInfo, todoId, userId)
    logger.info('Update todo successfully: ', updatedTodo)

    return {
      statusCode: 200
    }
  })