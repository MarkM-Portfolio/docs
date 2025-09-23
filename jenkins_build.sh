#!/bin/bash

#################################################################################################
# Date    : 2021.06.21
# Author  : todd-strangio@hcl.com
# Purpose : Script to pass to Jenkins for a docs_app build, should only ever run via Jenkins
# Version : 0.1
# Version History:
#   0.1 (2021.06.21): Initial version, replacing logic previously stored in Freestyle Jenkins job
#################################################################################################

echo "Running: $0"

export HOME=/home/cnxbuild
export BUILD_DIR=/local1/cnxbuild
export FE_DOWNLOAD_DIR=/mnt/mlsa2/workplace/dailykits,/mnt/mlsa2/workplace/dailybuilds,/mnt/mlsa2/workplace/goldkits,/mnt/mlsa2/workplace/goldbuilds
export ARTIFACTORY_HOST=https://artifactory.cwp.pnp-hcl.com/artifactory
export PropFile=${WORKSPACE}/${JOB_BASE_NAME}.properties
export CNXTOOLSZIP=${WORKSPACE}/cnxtools.zip
export CNXTOOLSURL=${ARTIFACTORY_HOST}/openlyAvailable-utils/cnxtools/cnxtools.zip
export PERL_BINARY=/usr/bin/perl
export CURL_BINARY=/usr/bin/curl
export UNZIP_BINARY=/usr/bin/unzip
export MASTERED_AREA=/mnt/mlsa2/workplace/dailybuilds

echo "Current user = `whoami`"
echo "id = `id`"
echo "Hostname = `hostname`"
echo "HOME = `echo ${HOME}`"

# JenkinsUser and JenkinsAPI are set via credentials binding within Jenkinsfile
if [ -z "${JenkinsUser}" ]; then
    echo "The environment variable JenkinsUser is required. Exiting."
    exit -9
fi

if [ -z "${JenkinsAPI}" ]; then
    echo "The environment variable JenkinsAPI is required. Exiting."
    exit -9
fi

# WORKSPACE, JOB_BASE_NAME, BUILD_TIMESTAMP, & BUILD_URL are default ENV vars set by Jenkins
# If they are not set, we're not running within Jenkins, so exit
if [ -z "${WORKSPACE}" ]; then
    echo "The environment variable WORKSPACE is required. Exiting."
    exit -9
fi

if [ -z "${JOB_BASE_NAME}" ]; then
    echo "The environment variable JOB_BASE_NAME is required. Exiting."
    exit -9
fi

if [ -z "${BUILD_TIMESTAMP}" ]; then
    echo "The environment variable BUILD_TIMESTAMP is required. Exiting."
    exit -9
fi

if [ -z "${BUILD_URL}" ]; then
    echo "The environment variable BUILD_URL is required. Exiting."
    exit -9
fi

if [ -z "${ECLIPSE_DIR}" ]; then
    export ECLIPSE_DIR=${HOME}/.eclipse
else
    echo "Will use the value of ECLIPSE_DIR, which is already set ['${ECLIPSE_DIR}']"
fi

if [ -z "${AWS_CONFIG_FILE}" ]; then
    export AWS_CONFIG_FILE=${HOME}/.aws/config
else
    echo "Will use the value of AWS_CONFIG_FILE, which is already set ['${AWS_CONFIG_FILE}']"
fi

if [ -z "${AWS_SHARED_CREDENTIALS_FILE}" ]; then
    export AWS_SHARED_CREDENTIALS_FILE=${HOME}/.aws/credentials
else
    echo "Will use the value of AWS_SHARED_CREDENTIALS_FILE, which is already set ['${AWS_SHARED_CREDENTIALS_FILE}']"
fi

if [ -z "${PERL_BINARY}" ]; then
    export PERL_BINARY=/usr/bin/perl
else
    echo "Will use the value of PERL_BINARY, which is already set ['${PERL_BINARY}']"
fi

if [ -d "${ECLIPSE_DIR}" ]; then
    mkdir -p ${ECLIPSE_DIR}
fi

# Make some dirs expected by buildGit.pl
mkdir -p ${BUILD_DIR}/jazz/util/bin/
chmod -R 755 ${BUILD_DIR}/jazz

# Fetch build tooling
echo "Downloading: ${CNXTOOLSURL} to ${CNXTOOLSZIP}"
${CURL_BINARY} -k -o ${CNXTOOLSZIP} ${CNXTOOLSURL}
echo "Unzipping: ${CNXTOOLSZIP} into ${BUILD_DIR}/jazz"
${UNZIP_BINARY} -o -q ${CNXTOOLSZIP} -d ${BUILD_DIR}/jazz/.
echo "Deleting: ${CNXTOOLSZIP}"
rm -f ${CNXTOOLSZIP}

# Open permissions on recently extracted files
echo "Opening permissions on ${BUILD_DIR}/jazz (to 0755)"
chmod -R 755 ${BUILD_DIR}/jazz

# Set some properties required by master.pl
export CMVC_RELEASE=${JOB_BASE_NAME}
export BUILDLEVEL=${BUILD_TIMESTAMP}

# Populate a properties file to pass to buildGit.pl
# Start with showing version info of required tools
echo "phase1L=which aws">${PropFile}
echo "phase2L=aws --version">>${PropFile}
echo "phase3L=which cmake">>${PropFile}
echo "phase4L=cmake --version">>${PropFile}
echo "phase5L=which make">>${PropFile}
echo "phase6L=make --version">>${PropFile}
echo "phase7L=which node">>${PropFile}
echo "phase8L=node -v">>${PropFile}
echo "phase9L=which npm">>${PropFile}
echo "phase10L=npm -v">>${PropFile}

# Actual build phases, includes mastering output to MLSA2
echo "phase20L=cd ${WORKSPACE}; ${WORKSPACE}/build.sh">>${PropFile}
echo "phase22L=mv ${WORKSPACE}/Build/OnPremise ${WORKSPACE}/.">>${PropFile}
echo "phase24L=mv ${WORKSPACE}/Build/piis ${WORKSPACE}/.">>${PropFile}
echo "phase26L=mv ${WORKSPACE}/Build/SmartCloud ${WORKSPACE}/.">>${PropFile}
echo "phase28L=mv ${WORKSPACE}/Build/tests ${WORKSPACE}/.">>${PropFile}
echo "phase30L=${CURL_BINARY} -k -u ${JenkinsUser}:${JenkinsAPI} -o ${WORKSPACE}/consoleText_${BUILD_TIMESTAMP}.log ${BUILD_URL}/consoleText">>${PropFile}
echo "phase32L=rm -f ${PropFile}">>${PropFile}
echo "phase38L=${PERL_BINARY} ${BUILD_DIR}/jazz/util/bin/master.pl -b -t ${MASTERED_AREA} -m OnPremise\,piis\,SmartCloud\,tests">>${PropFile}

# Run buildGit.pl
export CMD="${PERL_BINARY} ${BUILD_DIR}/jazz/buildGit.pl ${JOB_BASE_NAME} -d 3 -NoTimefile -NoTools -x ${PropFile}"
echo "Running CMD: ${CMD}"
${CMD}
