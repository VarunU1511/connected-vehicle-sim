# AUTO Connected Vehicle Platform Simulation

A high-fidelity simulation of an event-driven SOA microservice that simulates 100 vehicles sending real-time telemetry via Apache Kafka (KRaft) to an AWS LocalStack-managed serverless backend, visualized on a Next.js real-time dashboard.

## Structure
- `dashboard/`: A Next.js (App Router) real-time dashboard styled with Tailwind CSS and Framer Motion that polls LocalStack to visualize the 100 vehicles live.
- `simulation/`: The Vehicle Car Simulator. Produces realistic mock GPS, Battery, and Speed values and reliably pushes them into the Kafka broker.
- `infra/`: AWS CDK + Native SDK Scripts. Includes `setup-local.ts` to instantly provision LocalStack DynamoDB and S3 for testing, alongside standard CDK definitions for production deployment.
- `services/telemetry-processor`: The Consumer Lambda. Retrieves batched messages from Kafka/MSK, handles data transformation, and writes immutable state to DynamoDB and historical logs to S3.
- `shared/`: Shared TypeScript payload types and constants.

## Running Locally

Experience the complete end-to-end architecture on your machine without any AWS cloud costs.

**1. Start the Distributed Infrastructure (Kafka & LocalStack AWS)**
```bash
yarn docker:up
```

**2. Provision the AWS Resources on LocalStack**
*Creates the `VehicleState` DynamoDB table and `vehiclelogs` S3 Bucket using the native AWS SDK.*
```bash
yarn local:infra
```

**3. Start the Lambda Consumer Bridge**
*In a new terminal, run this script to bridge the local Kafka topic directly to your Lambda handler function:*
```bash
cd services/telemetry-processor
yarn install
yarn start
```

**4. Start the 100-Vehicle Simulation Fleet**
*In a new terminal, launch the vehicles onto the virtual road to begin emitting telemetry:*
```bash
yarn start:producer
```

**5. Launch the Real-Time Fleet Dashboard**
*In a new terminal, start the Next.js front-end:*
```bash
cd dashboard
yarn dev
```
Navigate to **http://localhost:3000** to watch the entire architecture in action!
