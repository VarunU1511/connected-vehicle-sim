import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Initialize identical configuration as the telemetry-processor Lambda
const isLocal = true; // Hardcoded true for LocalStack demo
const localstackEndpoint = 'http://localhost:4566';
const region = 'us-east-1';

const localCredentials = { accessKeyId: 'test', secretAccessKey: 'test' };

const ddbClient = new DynamoDBClient({
    endpoint: localstackEndpoint,
    region,
    credentials: localCredentials
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const STATE_TABLE = 'VehicleState';

// Forces Next.js to dynamically render this API route on every request, no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const result = await docClient.send(new ScanCommand({
            TableName: STATE_TABLE,
        }));

        // Next.js NextResponse automatically serializes the array into JSON
        return NextResponse.json({
            success: true,
            count: result.ScannedCount,
            vehicles: result.Items || []
        });
    } catch (error) {
        console.error('API Error querying DynamoDB:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vehicle state' },
            { status: 500 }
        );
    }
}
