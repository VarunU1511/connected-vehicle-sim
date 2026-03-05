import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface IotStackProps extends cdk.StackProps {
    processorLambda: lambda.Function;
}

export class IotStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: IotStackProps) {
        super(scope, id, props);

        // In a real-world scenario with Amazon MSK (Managed Streaming for Kafka),
        // you would configure an event source mapping here.
        // E.g., MSK Event Source invoking the Lambda

        // For this lab, the event source mapping logic would securely link MSK to `props.processorLambda`
    }
}
