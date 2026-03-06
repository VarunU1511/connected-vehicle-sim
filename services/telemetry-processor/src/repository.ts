import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from 'redis';

const isLocal = process.env.NODE_ENV !== 'production';
const localstackEndpoint = 'http://localhost:4566';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const region = 'us-east-1';

const localCredentials = { accessKeyId: 'test', secretAccessKey: 'test' };

const ddbClient = new DynamoDBClient(
    isLocal ? { endpoint: localstackEndpoint, region, credentials: localCredentials } : {}
);
const docClient = DynamoDBDocumentClient.from(ddbClient);

const s3Client = new S3Client(
    isLocal ? { endpoint: localstackEndpoint, region, forcePathStyle: true, credentials: localCredentials } : {}
);

const redisClient = createClient({ url: redisUrl });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

let redisConnected = false;
const connectRedis = async () => {
    if (!redisConnected) {
        await redisClient.connect();
        redisConnected = true;
    }
};

const STATE_TABLE = process.env.STATE_TABLE_NAME || 'VehicleState';
const LOGS_BUCKET = process.env.LOGS_BUCKET_NAME || 'vehiclelogs';
const REDIS_KEY = 'vehicles:state';

// Idempotency check happens implicitly here by overwriting state, or using conditional logic
export const updateVehicleState = async (telemetry: any) => {
    // 1. Update DynamoDB (Source of Truth)
    const command = new PutCommand({
        TableName: STATE_TABLE,
        Item: {
            vin: telemetry.vin,
            lastUpdated: new Date().toISOString(),
            state: telemetry
        },
    });

    await docClient.send(command);

    // 2. Update Redis (Cache)
    try {
        await connectRedis();
        await redisClient.hSet(REDIS_KEY, telemetry.vin, JSON.stringify({
            vin: telemetry.vin,
            lastUpdated: new Date().toISOString(),
            state: telemetry
        }));
    } catch (err) {
        console.error('Failed to update Redis cache:', err);
    }
};

export const saveToLogs = async (telemetry: any) => {
    const timestamp = Date.now();
    const key = `logs/${telemetry.vin}/${timestamp}-${telemetry.sequenceId}.json`;

    const command = new PutObjectCommand({
        Bucket: LOGS_BUCKET,
        Key: key,
        Body: JSON.stringify(telemetry),
        ContentType: "application/json"
    });

    await s3Client.send(command);
};
