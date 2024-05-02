import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

const dynamoDb = new DynamoDB()
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDb)
const dynamoDbClient = DynamoDBDocument.from(dynamoDbXRay)
export default dynamoDbClient
