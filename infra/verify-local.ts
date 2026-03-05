import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

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

const verify = async () => {
    console.log('🔍 Querying LocalStack AWS Environment...\n');

    try {
        const ddbResult = await ddbClient.send(new ListTablesCommand({}));
        console.log('✅ DynamoDB Tables Found:');
        console.log(ddbResult.TableNames);
    } catch (err) {
        console.error('❌ Failed to list DynamoDB Tables:', err);
    }

    console.log('');

    try {
        const s3Result = await s3Client.send(new ListBucketsCommand({}));
        console.log('✅ S3 Buckets Found:');
        console.log(s3Result.Buckets?.map(b => b.Name));
    } catch (err) {
        console.error('❌ Failed to list S3 Buckets:', err);
    }
};

verify();
