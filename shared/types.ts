export interface Location {
    lat: number;
    lon: number;
}

export interface TelemetryPayload {
    vin: string;
    sequenceId: number;
    eventTimestamp: string;
    speed: number;
    location: Location;
    batteryStatus: number;
}
