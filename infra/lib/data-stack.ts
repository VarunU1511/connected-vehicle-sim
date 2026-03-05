import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class DataStack extends cdk.Stack {
    public readonly stateTable: dynamodb.Table;
    public readonly logsBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // DynamoDB Table for Vehicle State
        this.stateTable = new dynamodb.Table(this, 'VehicleStateTable', {
            partitionKey: { name: 'vin', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For lab cleanup
        });

        // S3 Bucket for Historical Logs
        this.logsBucket = new s3.Bucket(this, 'HistoricalLogsBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true, // For lab cleanup
        });
    }
}
