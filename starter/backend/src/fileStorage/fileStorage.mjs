import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { TodosDataAccess } from '../dataLayer/todosDataAccess.mjs'

const todosDataAccess = new TodosDataAccess()

export async function generateImageUrl(todoId, userId) {
  
    const bucketName = process.env.TODOS_S3_BUCKET;

  const command = new PutObjectCommand({
    Bucket: process.env.TODOS_S3_BUCKET,
    Key: todoId
  })
  const s3url = await getSignedUrl(new S3Client(), command, {
    expiresIn: process.env.SIGNED_URL_EXPIRATION
  })
  await todosDataAccess.saveImgUrl(userId, todoId, bucketName);
  return s3url
}