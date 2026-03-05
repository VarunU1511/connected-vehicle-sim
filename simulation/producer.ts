import { Kafka, Partitioners } from 'kafkajs';
import { Vehicle } from './vehicle';
import { TOPICS } from '../shared/constants';

const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'connected-vehicle-producer';
const NUM_VEHICLES = 100;

// Initialize Kafka Client
const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: KAFKA_BROKERS,
});

// Configure Producer with Idempotency enabled
const producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
    maxInFlightRequests: 1, // Required for idempotency
    idempotent: true, // Idempotency ensures messages are not duplicated on producer retries
});

// Create 100 Vehicles
const vehicles: Vehicle[] = Array.from(
    { length: NUM_VEHICLES },
    (_, i) => new Vehicle(`VIN-AUTO-${(i + 1).toString().padStart(4, '0')}`)
);

const runSimulation = async () => {
    await producer.connect();
    console.log('✅ Connected to Kafka Producer successfully.');
    console.log(`Starting simulation for ${NUM_VEHICLES} vehicles on topic: ${TOPICS.VEHICLE_TELEMETRY_INGEST}`);

    // Send telemetry every 1000ms for a random subset of vehicles (e.g. 5)
    setInterval(async () => {
        const activeVehicles = Array.from({ length: 5 }, () => vehicles[Math.floor(Math.random() * vehicles.length)]);

        const messages = activeVehicles.map(vehicle => {
            const payload = vehicle.generateTelemetry();
            return {
                key: payload.vin, /* Using VIN as Key ensures all messages from same VIN go to the same Partition! This guarantees exact ordering per vehicle. */
                value: JSON.stringify(payload)
            };
        });

        try {
            const responses = await producer.send({
                topic: TOPICS.VEHICLE_TELEMETRY_INGEST,
                messages,
            });
            console.log(`📤 Pushed ${messages.length} telemetry events. Responses:`, responses);
        } catch (error) {
            console.error('❌ Failed to push to Kafka:', error);
        }
    }, 1000);
};

runSimulation().catch(console.error);

process.on('SIGINT', async () => {
    console.log('Stopping producer...');
    await producer.disconnect();
    process.exit(0);
});
