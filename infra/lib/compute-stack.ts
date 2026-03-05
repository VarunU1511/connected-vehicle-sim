import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';

interface ComputeStackProps extends cdk.StackProps {
    stateTable: dynamodb.Table;
    logsBucket: s3.Bucket;
}

export class ComputeStack extends cdk.Stack {
    public readonly processorLambda: lambda.Function;

    constructor(scope: Construct, id: string, props: ComputeStackProps) {
        super(scope, id, props);

        this.processorLambda = new nodejs.NodejsFunction(this, 'TelemetryProcessor', {
            entry: path.join(__dirname, '../../services/telemetry-processor/src/handler.ts'),
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_20_X,
            environment: {
                STATE_TABLE_NAME: props.stateTable.tableName,
                LOGS_BUCKET_NAME: props.logsBucket.bucketName,
            },
            bundling: {
                minify: true,
                sourceMap: true,
            },
        });

        // Grant Lambda permissions to state table and logs bucket
        props.stateTable.grantReadWriteData(this.processorLambda);
        props.logsBucket.grantWrite(this.processorLambda);
    }
}
