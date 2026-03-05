import { MSKEvent, MSKRecord } from 'aws-lambda';
import { transformTelemetry } from './transformer';
import { updateVehicleState, saveToLogs } from './repository';

export const handler = async (event: MSKEvent): Promise<void> => {
    console.log(`Received ${Object.keys(event.records).length} partitions from MSK`);

    for (const partitionKey in event.records) {
        const records: MSKRecord[] = event.records[partitionKey];
        console.log(`Processing partition: ${partitionKey} with ${records.length} records`);

        for (const record of records) {
            try {
                // Decode base64 payload from Kafka
                const rawPayload = Buffer.from(record.value, 'base64').toString('utf-8');
                const telemetry = JSON.parse(rawPayload);

                console.log(`Processing telemetry for VIN: ${telemetry.vin}, Sequence: ${telemetry.sequenceId}`);

                // Handle out-of-order data & extraction
                const processedData = transformTelemetry(telemetry);

                // Update exact current state in DynamoDB
                await updateVehicleState(processedData);

                // Append to historical logs in S3
                await saveToLogs(processedData);

            } catch (error) {
                // Error Handling & DLQ concept:
                // In a real system, failed records should be forwarded to a Dead Letter Queue 
                // (SQS or a separate Kafka topic) for retry or manual inspection.
                console.error('Error processing Kafka record:', error);
            }
        }
    }
};
