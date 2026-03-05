import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const isLocal = process.env.NODE_ENV !== 'production';
const localstackEndpoint = 'http://localhost:4566'; // or http://localstack:4566 inside Docker
const region = 'us-east-1';

const localCredentials = { accessKeyId: 'test', secretAccessKey: 'test' };

const ddbClient = new DynamoDBClient(
    isLocal ? { endpoint: localstackEndpoint, region, credentials: localCredentials } : {}
);
const docClient = DynamoDBDocumentClient.from(ddbClient);

const s3Client = new S3Client(
    isLocal ? { endpoint: localstackEndpoint, region, forcePathStyle: true, credentials: localCredentials } : {}
);

const STATE_TABLE = process.env.STATE_TABLE_NAME || 'VehicleState';
const LOGS_BUCKET = process.env.LOGS_BUCKET_NAME || 'vehiclelogs';

// Idempotency check happens implicitly here by overwriting state, or using conditional logic
export const updateVehicleState = async (telemetry: any) => {
    const command = new PutCommand({
        TableName: STATE_TABLE,
        Item: {
            vin: telemetry.vin,
            lastUpdated: new Date().toISOString(),
            state: telemetry
        },
        // ConditionExpression: "attribute_not_exists(sequenceId) OR sequenceId < :incomingSeq",
        // ExpressionAttributeValues: { ":incomingSeq": telemetry.sequenceId }
        // Conditional logic solves out-of-order data overwriting newer data!
    });

    await docClient.send(command);
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
