
 import { Stage, StageProps } from 'aws-cdk-lib/aws-apigateway/lib/stage';
import { GameDemoFargateDockerStack } from './game-demo-fargate-docker-stack';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class GameDemoFargatePipelineStage extends cdk.Stage {
    
    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
      super(scope, id, props);
  
      const gameDemoDockerStack = new GameDemoFargateDockerStack(this, 'MyFargateDockerStack' );

    }
}