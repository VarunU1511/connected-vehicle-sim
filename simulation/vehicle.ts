import { generateBatteryStatus, generateLocation, generateSpeed } from './mock-data';
import { TelemetryPayload } from '../shared/types';

export class Vehicle {
    private vin: string;
    private sequenceId: number;
    private baseLat: number;
    private baseLon: number;

    constructor(vin: string, baseLat: number = 18.5204, baseLon: number = 73.8567) {
        this.vin = vin;
        this.sequenceId = 0;
        this.baseLat = baseLat;
        this.baseLon = baseLon;
    }

    public getVin(): string {
        return this.vin;
    }

    public generateTelemetry(): TelemetryPayload {
        this.sequenceId++; // Increment sequenceId on every payload generation
        return {
            vin: this.vin,
            sequenceId: this.sequenceId,
            eventTimestamp: new Date().toISOString(), // Handling EventTime vs ProcessingTime in Kafka
            speed: generateSpeed(),
            location: generateLocation(this.baseLat, this.baseLon),
            batteryStatus: generateBatteryStatus(),
        };
    }
}
