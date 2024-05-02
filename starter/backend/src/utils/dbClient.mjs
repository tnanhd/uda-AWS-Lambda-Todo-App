import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
export default dynamoDbClient
