import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const localstackEndpoint = 'http://localhost:4566';
const region = 'us-east-1';

const ddbClient = new DynamoDBClient({
    endpoint: localstackEndpoint,
    region,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const s3Client = new S3Client({
    endpoint: localstackEndpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});

const readData = async () => {
    console.log('🔍 Checking for real telemetry data in LocalStack...\n');

    try {
        const ddbResult = await docClient.send(new ScanCommand({
            TableName: 'VehicleState',
            Limit: 2
        }));
        console.log(`✅ DynamoDB 'VehicleState' Table - Scanned ${ddbResult.ScannedCount} items.`);
        if (ddbResult.Items && ddbResult.Items.length > 0) {
            console.log('Sample Vehicle States:');
            console.dir(ddbResult.Items, { depth: null, colors: true });
        } else {
            console.log('⚠️ No items found in DynamoDB yet. Ensure producer and local-runner are both running.');
        }
    } catch (err) {
        console.error('❌ Failed to scan DynamoDB Table:', err);
    }

    console.log('\n----------------------------------------\n');

    try {
        const s3Result = await s3Client.send(new ListObjectsV2Command({
            Bucket: 'vehiclelogs',
            MaxKeys: 3
        }));
        console.log(`✅ S3 'vehiclelogs' Bucket - Found ${s3Result.KeyCount} matching keys.`);
        if (s3Result.Contents && s3Result.Contents.length > 0) {
            console.log('Sample S3 Object Keys:');
            console.log(s3Result.Contents.map(c => c.Key));
        } else {
            console.log('⚠️ No objects found in S3 yet.');
        }
    } catch (err) {
        console.error('❌ Failed to list S3 Bucket Objects:', err);
    }
};

readData();
