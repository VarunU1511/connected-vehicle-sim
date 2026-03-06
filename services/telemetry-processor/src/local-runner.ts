import { Kafka, EachBatchPayload } from 'kafkajs';
import { MSKEvent } from 'aws-lambda';
import { handler } from './handler';
import * as dotenv from 'dotenv';
import path from 'path';

// Load variables from root .env if running from root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // fallback

const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
const TOPIC = process.env.KAFKA_TOPIC || 'vehicle-telemetry-ingest';
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'connected-vehicle-processor';

const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: KAFKA_BROKERS
});

const consumer = kafka.consumer({
    groupId: 'telemetry-processing-group',
    sessionTimeout: 60000, // Increase session timeout to 60s
    maxBytesPerPartition: 1024 * 1024 // Limit to 1MB per partition poll to keep batches manageable
});

const admin = kafka.admin();

const runLocalMSKTrigger = async () => {
    console.log('🔄 Starting Local MSK ➡️ Lambda Bridge...');

    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes(TOPIC)) {
        console.log(`⚠️ Topic ${TOPIC} not found. Creating it now...`);
        await admin.createTopics({
            topics: [{ topic: TOPIC, numPartitions: 3 }]
        });
        // Give Kafka a second to register it
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await admin.disconnect();

    await consumer.connect();
    console.log('✅ Connected to Local Kafka Broker.');

    await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

    await consumer.run({
        eachBatchAutoResolve: true,
        eachBatch: async (payload: EachBatchPayload) => {
            const { batch, resolveOffset, heartbeat, isRunning, isStale } = payload;

            console.log(`\n📦 Received batch of ${batch.messages.length} messages from partition ${batch.partition}`);

            // 1. Transform KafkaJS batch into a fake AWS MSKEvent structure
            const mockMskEvent: MSKEvent = {
                eventSource: "aws:kafka",
                eventSourceArn: "arn:aws:kafka:us-east-1:000000000000:cluster/local-cluster/123",
                bootstrapServers: KAFKA_BROKERS.join(','),
                records: {
                    [`${batch.topic}-${batch.partition}`]: batch.messages.map(msg => ({
                        topic: batch.topic,
                        partition: batch.partition,
                        offset: parseInt(msg.offset, 10),
                        timestamp: parseInt(msg.timestamp, 10),
                        timestampType: "CREATE_TIME",
                        key: msg.key?.toString('base64') || "",
                        value: msg.value?.toString('base64') || "",
                        headers: []
                    }))
                }
            };

            // 2. Invoke the actual Lambda handler
            try {
                await handler(mockMskEvent);
                console.log(`✅ Batch processed successfully. Offsets marked.`);
            } catch (error) {
                console.error(`❌ Lambda execution failed:`, error);
                // In production, throwing here prevents offset commit and causes a retry loop
                // throw error; 
            }
        },
    });
};

runLocalMSKTrigger().catch(err => {
    console.error(`💥 Fatal Consumer Error:`, err);
    process.exit(1);
});
