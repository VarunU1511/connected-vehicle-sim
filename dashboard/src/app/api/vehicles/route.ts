import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createClient } from 'redis';

// Initialize identical configuration as the telemetry-processor Lambda
const isLocal = true; // Hardcoded true for LocalStack demo
const localstackEndpoint = 'http://localhost:4566';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const region = 'us-east-1';

const localCredentials = { accessKeyId: 'test', secretAccessKey: 'test' };

const ddbClient = new DynamoDBClient({
    endpoint: localstackEndpoint,
    region,
    credentials: localCredentials
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const redisClient = createClient({ url: redisUrl });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

let redisConnected = false;
const connectRedis = async () => {
    if (!redisConnected) {
        await redisClient.connect();
        redisConnected = true;
    }
};

const STATE_TABLE = 'VehicleState';
const REDIS_KEY = 'vehicles:state';

// Forces Next.js to dynamically render this API route on every request, no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await connectRedis();

        // 1. Try to fetch from Redis Cache
        const cachedData = await redisClient.hVals(REDIS_KEY);

        if (cachedData && cachedData.length > 0) {
            const vehicles = cachedData.map(v => JSON.parse(v));
            return NextResponse.json({
                success: true,
                count: vehicles.length,
                vehicles: vehicles,
                source: 'cache'
            });
        }

        // 2. Fallback to DynamoDB if Cache is empty
        console.log('Cache miss, falling back to DynamoDB');
        const result = await docClient.send(new ScanCommand({
            TableName: STATE_TABLE,
        }));

        return NextResponse.json({
            success: true,
            count: result.ScannedCount,
            vehicles: result.Items || [],
            source: 'database'
        });
    } catch (error) {
        console.error('API Error querying vehicle data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vehicle state' },
            { status: 500 }
        );
    }
}
