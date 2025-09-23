BuildDefinition = env.JOB_BASE_NAME
prefix = env.JOB_BASE_NAME
env.prefix = prefix
build_ok = true
buildGit_PropFile = "${prefix}.properties"

// We want Jenkinsfile to be flexible to build any repo, but want to also not need to enter a ton of parameters/properties
// Users can override the GitHub repository to build by setting an environment variable named "custom_git_repo"

env.repos = 'docs'
env.buildNodeExpression = 'cnx-build-centos7-1'

setEnvironmentVariablesStageDescription = "Setting Environment Variables"
getBuildCausesStageDescription = "Getting Build Causes"
setBuildParametersAndPropertiesStageDescription = "Setting Build Parameters & Properties"
setAdditionalEnvironmentSettingsStageDescription = "Setting Additional Environment Settings"
printEnvironmentVariablesStageDescription = "Printing Environment Variables"
buildStageDescription = "Building " + BuildDefinition
createJobResultSummaryStageDescription = "Creating Job Result Summary"
pruneAbandonedBuildsStageDescription = "Removing Abandoned Builds"

// buildNodeExpression is a parameter of the job, defined below
buildNodeExpression = env.buildNodeExpression

// Set job's workspace
if ( env.ws ) {
    ws = env.ws
} else {
    ws = "/local1/cnxbuild/docs_app"
}

node(buildNodeExpression) {

    ws("${ws}") {
        // 1) Set environment variables
        stage("${setEnvironmentVariablesStageDescription}") {
            setEnvironmentVariables()
        }

        // 2) Get build causes
        stage("${getBuildCausesStageDescription}") {
            getBuildCauses()
        }

        // 3) Set build parameters
        stage("${setBuildParametersAndPropertiesStageDescription}") {
            setBuildParametersAndProperties()
        }

        // 4) Checkout source
        stage("${checkoutAndSetupStageDescription}") {
            //node(buildNodeExpression) {
                checkoutAndSetup()
            //}
        }

        // 5) Print Environment Variables
        stage("${printEnvironmentVariablesStageDescription}") {
            printEnvironmentVariables()
        }

        // 6) Build
        stage("${buildStageDescription}") {
            try {
                //node(buildNodeExpression) {
                    buildStage()
                //}
            } catch(e) {
                build_ok = false
                env.build_ok = false
                echo e.toString()
            }
        }

        // 7) Create Summary
        stage("${createJobResultSummaryStageDescription}") {
            createSummary()
        }

        // 8) Prune Abandoned Builds
        stage("${pruneAbandonedBuildsStageDescription}") {
            pruneAbandonedBuilds()
        }

        // 9) Delete Workspace
        stage("Delete Workspace") {
            if (build_ok) {
                deleteWorkspace()
            } else {
                echo "Not deleting ${WORKSPACE}, as build result is not SUCCESS."
            }
        }
    }
}

//**********************************************************************************************
//
// Functions
//
//**********************************************************************************************

void setEnvironmentVariables() {

    if (env.mlsa2_mount) {
        mlsa2_mount = env.mlsa2_mount
    } else {
        if (isUnix()) {
            mlsa2_mount = '/mnt/mlsa2'
        } else {
            mlsa2_mount = '\\\\mlsa2.cnx.cwp.pnp-hcl.com\\aws-hcl-cwp-hawkins-mlsa2'
        }
        env.mlsa2_mount = mlsa2_mount
    }

    if (env.currentBuildPropFile) {
        currentBuildPropFile = env.currentBuildPropFile
    } else {
        if (isUnix()) {
            currentBuildPropFile = "${mlsa2_mount}/workplace/dailybuilds/" + prefix + "/BranchLatest.txt"
        } else {
            currentBuildPropFile = "${mlsa2_mount}\\workplace\\dailybuilds\\" + prefix + "\\BranchLatest.txt"
        }
        env.currentBuildPropFile = currentBuildPropFile
    }

    // The following used to create build label
    now = new Date()
    TimeStamp = now.format("yyyyMMdd-HHmm", TimeZone.getTimeZone('America/New_York'))
    currentBuild.displayName = BuildDefinition + "_" + TimeStamp
    currentBuild.description = ""
    env.BUILD_TIMESTAMP = TimeStamp

    // "repos" needs to be set in Jenkins Job, or env.repos at the top of this Jenkinsfile, and is used to determine which repo's to pull
    if (env.custom_git_repo) {
        allRepos = env.custom_git_repo
    } else {
        allRepos = env.repos
        env.repos = repos
    }

    //allRepos = env.repos
    repoList = allRepos.split(",")

    // These settings can be overriden in Jenkins Job via EnvInject plugin, otherwise default values are used
    if (env.BUILD_DIR) {
        BUILD_DIR = env.BUILD_DIR
    } else {
        if (isUnix()) {
            BUILD_DIR = '/local1/cnxbuild'
        } else {
            BUILD_DIR = 'E:\\'
        }
        env.BUILD_DIR = BUILD_DIR
    }

    if ( env.RTC_BUILD_DIR ) {
        RTC_BUILD_DIR = env.RTC_BUILD_DIR
    } else {
        if (isUnix()) {
            RTC_BUILD_DIR = '/local1/cnxbuild'
        } else {
            RTC_BUILD_DIR = 'E:\\'
        }
        env.RTC_BUILD_DIR = RTC_BUILD_DIR
    }

    if (env.jazzTools) {
        jazzTools = env.jazzTools
    } else {
        if (isUnix()) {
            jazzTools = env.BUILD_DIR + '/jazz'
        } else {
            jazzTools = env.BUILD_DIR + '\\jazz'
        }
        env.jazzTools = jazzTools
    }

    if (env.JAVA_HOME) {
        JAVA_HOME = env.JAVA_HOME
    } else {
        if (isUnix()) {
            //JAVA_HOME = '/usr'
            JAVA_HOME = '/local1/cnxbuild/Java18IBM'
        } else {
            JAVA_HOME = 'E:\\tools\\' + prefix + '\\Java60'
        }
        env.JAVA_HOME = JAVA_HOME
    }

    if (env.PRODUCTION_VERSION) {
        PRODUCTION_VERSION = env.PRODUCTION_VERSION
    } else {
        PRODUCTION_VERSION = '1'
        env.PRODUCTION_VERSION = PRODUCTION_VERSION
    }

    if (env.absToolsPath) {
        absToolsPath = env.absToolsPath
    } else {
        if (isUnix()) {
            absToolsPath = env.BUILD_DIR + '/tools/' + prefix
        } else {
            absToolsPath = env.BUILD_DIR + '\\tools\\' + prefix
        }
        env.absToolsPath = absToolsPath
    }

    if (env.FE_DOWNLOAD_DIR) {
        FE_DOWNLOAD_DIR = env.FE_DOWNLOAD_DIR
    } else {
        if (isUnix()) {
            FE_DOWNLOAD_DIR = "${mlsa2_mount}/workplace/dailykits,${mlsa2_mount}/workplace/dailybuilds,${mlsa2_mount}/workplace/goldkits,${mlsa2_mount}/workplace/goldbuilds"
        } else {
            FE_DOWNLOAD_DIR = "${mlsa2_mount}\\workplace\\dailykits,${mlsa2_mount}\\workplace\\dailybuilds,${mlsa2_mount}\\workplace\\goldkits,${mlsa2_mount}\\workplace\\goldbuilds"
        }
        env.FE_DOWNLOAD_DIR = FE_DOWNLOAD_DIR
    }

    if (env.keep_abandon) {
        keep_abandon = env.keep_abandon
    } else {
        keep_abandon = 3
        env.keep_abandon = 3
    }

    prune_java_arg = ''
    if (env.prune_java_arg) {
        prune_java_arg = '-javahome ' + env.prune_java_arg
    }
    env.prune_java_arg = prune_java_arg

    if (env.static_felement) {
        static_felement = env.static_felement
    } else {
        static_felement = 1
        env.static_felement = 1
    }

    if (env.gitURL) {
        gitURL = env.gitURL
    } else {
        gitURL = 'https://git.cwp.pnp-hcl.com/ic/'
        env.gitURL = gitURL
    }

    if (env.githubCredId) {
        githubCredId = env.githubCredId
    } else {
        githubCredId = 'connbld_github_api_token'
        env.githubCredId = githubCredId
    }

    if (env.buildGitOptions) {
        buildGitOptions = ' ' + env.buildGitOptions + ' '
        env.buildGitOptions = buildGitOptions
    } else {
        buildGitOptions = "-NoTools -x ${buildGit_PropFile}"
        env.buildGitOptions = buildGitOptions
    }

    if (env.FS) {
        FS = env.FS
    } else {
        if (isUnix()) {
            FS = "${mlsa2_mount}/workplace/dailybuilds"
        } else {
            FS = "${mlsa2_mount}\\workplace\\dailybuilds"
        }
        env.FS = FS
    }

}

void getBuildCauses() {

    causes = currentBuild.getBuildCauses()
    echo "causes = ${causes}"
    if (causes) {
        env.BUILD_CAUSE = causes
    }

}

void setBuildParametersAndProperties() {

    properties([
        parameters([
            choice(
                choices: ['false', 'true'],
                description: '<BR><font color="blue" size="4">This job run should build a patch, true or false???<BR><BR></font>',
                name: 'PATCH_ENABLE',
            ),
            string(
                defaultValue: 'master',
                description: '<BR><font color="blue" size="4">Git branch (default: master)<BR><BR></font>',
                name: 'branchName',
            )
        ]),

        buildDiscarder(logRotator(
            //artifactDaysToKeepStr: '7',
            artifactNumToKeepStr: '25',
            //daysToKeepStr: '7',
            numToKeepStr: '25')
        )
    ])

    if ( "${params.PATCH_ENABLE}" ) {
        PATCH_ENABLE = "${params.PATCH_ENABLE}"
    } else {
        // We should never get here, but best to defend
        PATCH_ENABLE = "false"
    }
    env.PATCH_ENABLE = PATCH_ENABLE

    if (( "${params.branchName}" ) && ("${params.branchName}" != null )) {
        branchName = "${params.branchName}"
    } else {
        branchName = "master"
    }
    env.branchName = branchName
    checkoutAndSetupStageDescription = "Retrieve Source\n" + allRepos.take(20) + ":" + branchName

}

void checkoutAndSetup() {
    deleteDir()
    env.nullString = "null"

    if (repoList.size() > 1) {
        for (String repoName : repoList) {
            dir("${repoName}") {
            repoURL = gitURL + repoName
                mapVars = checkout([
                    $class: 'GitSCM',
                    branches: [[
                          name: branchName
                    ]],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    submoduleCfg: [],
                    userRemoteConfigs: [[
                        credentialsId: "${githubCredId}",
                        url: "${repoURL}"
                    ]]
                ])

                env.GIT_COMMIT = mapVars.get('GIT_COMMIT')
                env.GIT_PREVIOUS_COMMIT = mapVars.get('GIT_PREVIOUS_COMMIT')
                env.GIT_PREVIOUS_SUCCESSFUL_COMMIT = mapVars.get('GIT_PREVIOUS_SUCCESSFUL_COMMIT')
                env.repoSha = BuildDefinition + "_" + TimeStamp + "," + env.GIT_COMMIT + "," + repoName + "," + branchName
                env.justSha = env.GIT_COMMIT + "," +  env.GIT_PREVIOUS_SUCCESSFUL_COMMIT

                if (isUnix()) {
                    sh """
                        echo ${env.repoSha} >> ../GIT_COMMIT_SHA.txt
                        echo ${env.justSha} >> ../GIT_JUST_SHA.txt
                        if [[ "${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}" == "${env.nullString}" ]]; then
                            echo "New repo" >> list_of_changes.txt
                        else
                            git diff --name-only ${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT} ${env.GIT_COMMIT} >> ../list_of_changes.txt
                        fi
                    """
                } else {
                    bat '''
                        echo %repoSha% >> ..\\GIT_COMMIT_SHA.txt
                        echo %justSha% >> ..\\GIT_JUST_SHA.txt
                        echo "line 366"
                        if %GIT_PREVIOUS_SUCCESSFUL_COMMIT%. == %nullString%. (
                            echo "New repo" >> list_of_changes.txt
                        ) else (
                            git diff --name-only %GIT_PREVIOUS_SUCCESSFUL_COMMIT% %GIT_COMMIT% >> ..\\list_of_changes.txt
                        )
                    '''
                }
            }
        }
    } else {
        for (String repoName : repoList) {
            repoURL = gitURL + repoName
            mapVars = checkout([
                $class: 'GitSCM',
                branches: [[
                      name: branchName
                ]],
                doGenerateSubmoduleConfigurations: false,
                extensions: [],
                submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: "${githubCredId}",
                    url: "${repoURL}"
                ]]
            ])

            env.GIT_COMMIT = mapVars.get('GIT_COMMIT')
            env.GIT_PREVIOUS_COMMIT = mapVars.get('GIT_PREVIOUS_COMMIT')
            env.GIT_PREVIOUS_SUCCESSFUL_COMMIT = mapVars.get('GIT_PREVIOUS_SUCCESSFUL_COMMIT')
            env.repoSha = BuildDefinition + "_" + TimeStamp + "," + env.GIT_COMMIT + "," + repoName + "," + branchName
            env.justSha = env.GIT_COMMIT + "," +  env.GIT_PREVIOUS_SUCCESSFUL_COMMIT

            if (isUnix()) {
                sh """
                    echo ${env.repoSha} >> GIT_COMMIT_SHA.txt
                    echo ${env.justSha} >> GIT_JUST_SHA.txt

                    if [[ "${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}" == "${env.nullString}" ]]; then
                        echo "New repo" >> list_of_changes.txt
                    else
                        git diff --name-only ${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT} ${env.GIT_COMMIT} >> list_of_changes.txt
                    fi
                """
            } else {
                bat '''
                    echo %repoSha% >> GIT_COMMIT_SHA.txt
                    echo %justSha% >> GIT_JUST_SHA.txt
                    echo "GIT_PREVIOUS_SUCCESSFUL_COMMIT = %GIT_PREVIOUS_SUCCESSFUL_COMMIT%"
                    echo "GIT_COMMIT                     = %GIT_COMMIT%"
                    if %GIT_PREVIOUS_SUCCESSFUL_COMMIT%. == %nullString%. (
                        echo "New repo" >> list_of_changes.txt
                    ) else (
                        git diff --name-only %GIT_PREVIOUS_SUCCESSFUL_COMMIT% %GIT_COMMIT% >> list_of_changes.txt
                    )
                '''
            }
        }
    }
}

void printEnvironmentVariables(){
    echo "Environment Variables:\n\n"
    echo "TimeStamp = ${TimeStamp}\n"
    echo "prefix = ${prefix}\n"
    echo "WORKSPACE = ${WORKSPACE}\n"
    echo "BUILD_URL = ${BUILD_URL}\n"
    echo "PATCH_ENABLE = ${PATCH_ENABLE}\n"
    echo "JENKINS_HOME = ${JENKINS_HOME}\n"
    echo "JENKINS_URL = ${JENKINS_URL}\n"
    echo "JOB_URL = ${JOB_URL}\n"
    echo "BUILD_DISPLAY_NAME = ${BUILD_DISPLAY_NAME}\n"
    echo "JOB_NAME = ${JOB_NAME}"
    echo "JOB_BASE_NAME = ${JOB_BASE_NAME}"
    echo "PATCH_ENABLE = ${PATCH_ENABLE}"
    echo "branchName = ${branchName}"
    echo "currentBuildPropFile = ${currentBuildPropFile}"
    echo "buildGit_PropFile = ${buildGit_PropFile}"
}

void buildStage(){
    if (isUnix()){
        sh """
            /usr/bin/chmod -R 755 ${WORKSPACE}
        """
    } else {
        bat '''

        '''
    }

    // Since the above 'withCredentials' block is using the same credential, we could combine, although I've left separate in the event you want the first block to take action on the docker HOST, and have this block take action on the Docker CONTAINER
    withCredentials([usernamePassword(credentialsId: 'connbld_artifactory_api_token', passwordVariable: 'ArtifactoryAPI', usernameVariable: 'ArtifactoryUser')]) {

        withCredentials([usernamePassword(credentialsId: 'connbld_job_results_pruning', passwordVariable: 'JenkinsAPI', usernameVariable: 'JenkinsUser')]) {

            // Define characteristics of the Docker registry & Dockerimage ( including Docker tag )
            docker_registry = 'buildutils-docker.artifactory.cwp.pnp-hcl.com'
            docker_image = 'docs_app-build'
            docker_image_tag = 'latest'

            docker.withRegistry("https://${docker_registry}") {

                docker.image("${docker_registry}/${docker_image}:${docker_image_tag}").pull()
                docker.image("${docker_registry}/${docker_image}:${docker_image_tag}").inside("-v ${mlsa2_mount}:${mlsa2_mount} -v /home/cnxbuild/.aws/config:/home/cnxbuild/.aws/config -v /home/cnxbuild/.aws/credentials:/home/cnxbuild/.aws/credentials -v /home/cnxbuild/.eclipse:/home/cnxbuild/.eclipse") {

                    sh """
                        ${WORKSPACE}/jenkins_build.sh
                    """
                }
            }
        }
    }
}

void createSummary() {
    //node(buildNodeExpression) {

        // Jenkins icon options --> https://github.com/jenkinsci/jenkins/tree/master/war/src/main/webapp/images/16x16
        // Groovy Post Build-provided options --> https://wiki.jenkins.io/display/JENKINS/Groovy+Postbuild+Plugin
        // Multiple summaries are allowed, code below shows examples of different icon options

        def dependency_exists = fileExists 'logs/dependency.txt'
        if (dependency_exists) {
            archiveArtifacts artifacts: 'logs/dependency.txt'
        }

        def dependency_hostnames_exists = fileExists 'logs/dependency_hostnames.txt'
        if (dependency_hostnames_exists) {
            archiveArtifacts artifacts: 'logs/dependency_hostnames.txt'
        }

        def HostName_exists = fileExists 'logs/HostName.txt'
        if (HostName_exists) {
            archiveArtifacts artifacts: 'logs/HostName.txt'
        }

        def git_commit_sha_exists = fileExists 'GIT_COMMIT_SHA.txt'
        if (git_commit_sha_exists) {
            archiveArtifacts artifacts: 'GIT_COMMIT_SHA.txt'
        }

        def list_of_changes_exists = fileExists 'list_of_changes.txt'
        if (list_of_changes_exists) {
            archiveArtifacts artifacts: 'list_of_changes.txt'
        }

        def build_maven_log = "Build/maven_${BUILD_TIMESTAMP}.log"
        def build_maven_exists = fileExists "${build_maven_log}"
        if (build_maven_exists) {
            archiveArtifacts artifacts: "${build_maven_log}"
        }

        def build_fixpack_log = "Build/fixpack_${BUILD_TIMESTAMP}.log"
        def build_fixpack_exists = fileExists "${build_fixpack_log}"
        if (build_fixpack_exists) {
            archiveArtifacts artifacts: "${build_fixpack_log}"
        }

        manager.addShortText("Docker host: ${buildNodeExpression}","blue","white","1px","white")
        manager.addShortText("Docker registry: ${docker_registry}","blue","white","1px","white")
        manager.addShortText("Docker image: ${docker_image}:${docker_image_tag}","blue","white","1px","white")
        manager.addShortText("Branch built: ${branchName}","blue","white","1px","white")
        manager.addShortText("Build Patch?: ${PATCH_ENABLE}","blue","white","1px","white")

        if(manager.logContains(".*No need to build!.*")) {
            manager.addShortText("No Changes")
            //manager.addWarningBadge("No Changes","#008000")
            manager.build.@result = hudson.model.Result.UNSTABLE
            //currentBuild.result = "UNSTABLE"
        } else if(manager.logContains(".*Abandoning Build because.*")) {
            manager.addShortText("AppScan Build","white","olive","0px","white")
            manager.build.@result = hudson.model.Result.UNSTABLE
        } else if((manager.logContains(".*Could not match supplied host pattern.*")) || (manager.logContains(".*UNREACHABLE.*"))) {
            manager.addShortText("One or more hosts was unreachable","black","yellow","0px","white")
            manager.build.@result = hudson.model.Result.UNSTABLE
        } else {

            if(manager.logContains(".*Prereqs changed!.*")) {
                manager.addShortText("Pereqs changed", "white", "blue", "0px", "white")
            }

            if(manager.logContains(".*Sources changed!.*")) {
                manager.addShortText("Sources changed", "white", "blue", "0px", "white")
            }

            if(manager.logContains(".*was forced!.*")) {
                manager.addShortText("Forced build", "white", "blue", "0px", "white")
            }

            if(build_ok) {
                manager.build.@result = hudson.model.Result.SUCCESS
                currentBuild.result = "SUCCESS"
                //createSummary icon:'secure.png', text: "<a href=\"${FS}/${BuildDefinition}/${currentBuild.displayName}\">View Build Logs on MLSA2</a>"
                //createSummary icon:'secure.png', text: "View Build Logs on MLSA2 - ${FS}/${BuildDefinition}/${currentBuild.displayName}"
                if (isUnix()) {
                    summaryText = "${FS}/${BuildDefinition}/${currentBuild.displayName}"
                } else {
                    summaryText = "${FS}\\${BuildDefinition}\\${currentBuild.displayName}"
                }
                createSummary icon:'secure.png', text: "Build Logs on MLSA2: ${summaryText}"

            } else {
                // archiveArtifacts artifacts: 'MultiBuild.*'
                def MultiBuild_log_exists = fileExists 'MultiBuild.log'
                if (MultiBuild_log_exists) {
                    archiveArtifacts artifacts: 'MultiBuild.log'
                }

                def MultiBuild_err_exists = fileExists 'MultiBuild.err'
                if (MultiBuild_err_exists) {
                    archiveArtifacts artifacts: 'MultiBuild.err'
                }

                manager.build.@result = hudson.model.Result.FAILURE
                currentBuild.result = "FAILURE"
            }
        }
    //}
}

void pruneAbandonedBuilds() {
    try {
        withCredentials([usernamePassword(credentialsId: 'connbld_job_results_pruning', usernameVariable: 'CLEAN_USERNAME', passwordVariable: 'CLEAN_PASSWORD')]) {
            if (isUnix()) {
                sh """
                    echo Using Credentials
                    perl ${jazzTools}/PruneAbandonedJenkinsBuilds.pl -keep ${env.keep_abandon} -user ${CLEAN_USERNAME} -pass ${CLEAN_PASSWORD} -joburl ${env.JOB_URL}
                """
            }  else {
                bat '''
                    echo This job is not supported on Windows ... sorry bud.
                '''
            }
        }
    } catch(cred_err) {
        //echo "Not Using Credentials Can not run Prune Job
        echo cred_err.toString()
    }
}

void deleteWorkspace() {
    try {
        //deleteDir() // this defaults to deleting WORKSPACE,
        // but I prefer the current implementation for consistency
        echo "Deleting ${WORKSPACE} (if it exists)"
        dir("${WORKSPACE}") {
            deleteDir()
        }

        echo "Deleting ${WORKSPACE}@tmp (if it exists)"
        dir("${WORKSPACE}@tmp") {
            deleteDir()
        }
    } catch(e) {
        echo "Caught exception: ${e}"
        echo "This is non-fatal, but please delete ${WORKSPACE} manually."
    }
}