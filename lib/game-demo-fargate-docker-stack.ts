import { Construct } from 'constructs';
import ec2 = require('aws-cdk-lib/aws-ec2');
import ecs = require('aws-cdk-lib/aws-ecs');
import logs = require('aws-cdk-lib/aws-logs');
import ecs_patterns = require('aws-cdk-lib/aws-ecs-patterns');
import cdk = require('aws-cdk-lib');
import path = require('path');

export class GameDemoFargateDockerStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC and Fargate Cluster
    // NOTE: Limit AZs to avoid reaching resource quotas
    const vpc = new ec2.Vpc(this, 'MyVpc', { maxAzs: 2 });

    // Add a cluster to ECS
    const cluster = new ecs.Cluster(this, 'MinecraftCluster', { vpc });

    // Create a task definition for the service
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MinecraftTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });

    // Create a container for the task
    const container = taskDefinition.addContainer('MinecraftContainer', {
      // Create the container image and store it in Elastic Container Registry (ECR). 
      // CDK will manage the creation and upload of the container image,
      // just add the folder path name to the .Docker file to be used as the container image.
      image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, 'minecraft-image')),
      environment: {
        EULA: 'TRUE',
        VERSION: 'LATEST',
        TYPE: 'FORGE',
        DIFFICULTY: 'NORMAL',
      },
      // create a log for the container (for installation troubleshooting)
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'Minecraft',
        logGroup: new logs.LogGroup(this, 'MinecraftLogGroup', {
          logGroupName: '/aws/ecs/Minecraft/',
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        },),
      })
    });

    // Add a the default Minecraft port mapping to the container.
    container.addPortMappings({
      containerPort: 25565,
      protocol: ecs.Protocol.TCP,

    });

    // create a Fargate service on the cluster 
    const service = new ecs.FargateService(this, 'MinecraftService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      assignPublicIp: true,
      desiredCount: 1,
    });

    // Allow inbound traffic to the service on port 25565 
    service.connections.allowFromAnyIpv4(
      ec2.Port.tcp(25565),
      'Allow inbound traffic to the service on port 25565'
    );

  }
}
