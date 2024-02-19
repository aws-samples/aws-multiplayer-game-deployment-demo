import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { GameDemoFargatePipelineStage } from './game-demo-fargate-pipeline-stage';

// This class represents the pipeline stack for a CI/CD pipeline. 
export class GameDemoPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const codecommitRepo = codecommit.Repository.fromRepositoryName(
      this,
      'cdk-container-sample',
      'cdk-container-sample'
    );

    // Gets the repository's branch name from the cdk.context.json file, otherwise it defaults to using 'main' as the branch.
    const defaultRepoBranchName = this.node.tryGetContext('default_repo_branch_name') || "main";

    // Instantiates the pipeline and adds a step to run specific commands for it (e.g. npm ci to clean up node modules before building)
    // This pipeline is self-mutating, and if any changes are made here and pushed upstream to Git,
    // they will trigger a pipeline update (e.g. Adding a new stage will trigger an update to the pipeline)
    const pipeline = new CodePipeline(this, 'GameDemoPipeline', {
      pipelineName: 'GameDemoPipeline',
      crossAccountKeys: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.codeCommit(codecommitRepo, defaultRepoBranchName),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    // Gets the account id and deployment region from the configuration file.
    const devAccountId = this.node.tryGetContext('dev_account_id');
    const deploymentRegion = this.node.tryGetContext('deployment_region');
  
    const demoStage = pipeline.addStage(new GameDemoFargatePipelineStage(this, "GameDemoPipelineStage", {
      env: { account: devAccountId, region: deploymentRegion }
    }));

    // If you wanted to also deploy the same application to another account, you would need to add another stage similar to the following code.
    // You would also need to run the bootstrap command for this account before deploying for the proper permissions.
    // const prodStage = pipeline.addStage(new GameDemoFargatePipelineStage(this, "GameDemoProductionPipelineStage", {
    //   env: { account: "prodAccountId", region: "us-west-2" }
    // }));

  }
}