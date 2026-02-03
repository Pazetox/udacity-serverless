import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

export class TodosDataAccess 
{    
    constructor() {
        this.todos = process.env.TODOS_TABLE
        this.todoIndex = process.env.TODOS_INDEX
        this.database = DynamoDBDocument.from(AWSXRay.captureAWSv3Client(new DynamoDB()))
    }

    async createItem(item) {
        logger.info('DataLayer - CreateItem');
        await this.database.put({ TableName: this.todos, Item: item })
        return item
    }

    async deleteItem(todoId, userId) {
        logger.info('DataLayer - DeleteItem');
        const isRemoved = await this.database.delete({ TableName: this.todos, Key: { todoId, userId } })
        return isRemoved
    }

    async getListOfTodo(userId) {
        logger.info('DataLayer - GetListOfItems');

        const todos = await this.database.query({
            TableName: this.todos,
            IndexName: this.todoIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
        return todos.Items
    }

    async saveImgUrl(userId, todoId, bucketName) {
        logger.info('DataLayer - SaveImgUrl');

        await this.database.update({
            TableName: this.todos,
            Key: { userId, todoId },
            ConditionExpression: 'attribute_exists(todoId)',
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
            }
        });
    }

    async updateItem(item) {
        logger.info('DataLayer - UpdateItem');

        const newTodo = await this.database.update({
            TableName: this.todos,
            Key: {
                todoId: item.todoId,
                userId: item.userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': item.name,
                ':dueDate': item.dueDate,
                ':done': item.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            }
        })
        return newTodo
    }

}