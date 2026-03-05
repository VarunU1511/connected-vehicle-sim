import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ComputeStack } from '../lib/compute-stack';
import { IotStack } from '../lib/iot-stack';

const app = new cdk.App();

const dataStack = new DataStack(app, 'AutoDataStack');

const computeStack = new ComputeStack(app, 'AutoComputeStack', {
    stateTable: dataStack.stateTable,
    logsBucket: dataStack.logsBucket,
});

const iotStack = new IotStack(app, 'AutoIotStack', {
    processorLambda: computeStack.processorLambda,
});
