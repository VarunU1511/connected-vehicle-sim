// Handles the logic for out-of-order execution, filtering, or mapping
export const transformTelemetry = (rawTelemetry: any) => {
    // In our simulation, dealing with Event Time vs Processing Time is critical.
    // Vehicles could be offline and send batched old data later.
    // Here we would assess if eventTimestamp is older than the last seen timestamp
    // in our state store.

    return {
        vin: rawTelemetry.vin,
        sequenceId: rawTelemetry.sequenceId,
        timestamp: rawTelemetry.eventTimestamp,
        speed: rawTelemetry.speed,
        location: rawTelemetry.location,
        battery: rawTelemetry.batteryStatus,
    };
};
