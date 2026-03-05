import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

const localstackEndpoint = 'http://localhost:4566';
const region = 'us-east-1';

const ddbClient = new DynamoDBClient({
    endpoint: localstackEndpoint,
    region,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});

const s3Client = new S3Client({
    endpoint: localstackEndpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});

const setup = async () => {
    try {
        console.log('📦 Creating VehicleState DynamoDB Table on LocalStack...');
        await ddbClient.send(new CreateTableCommand({
            TableName: 'VehicleState',
            KeySchema: [{ AttributeName: 'vin', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'vin', AttributeType: 'S' }],
            BillingMode: 'PAY_PER_REQUEST',
        }));
        console.log('✅ DynamoDB Table created successfully!');
    } catch (err: any) {
        if (err.name === 'ResourceInUseException') console.log('⚠️ DynamoDB Table already exists.');
        else console.error('❌ DynamoDB Error:', err);
    }

    try {
        console.log('📦 Creating vehiclelogs S3 Bucket on LocalStack...');
        await s3Client.send(new CreateBucketCommand({
            Bucket: 'vehiclelogs',
        }));
        console.log('✅ S3 Bucket created successfully!');
    } catch (err: any) {
        if (err.name === 'BucketAlreadyExists' || err.name === 'BucketAlreadyOwnedByYou') console.log('⚠️ S3 Bucket already exists.');
        else console.error('❌ S3 Error:', err);
    }
};

setup();
