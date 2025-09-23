#!/bin/bash

if [ -f ./pre_setup-env.sh ]
then
echo "Sourcing ./pre_setup-env.sh"
. ./pre_setup-env.sh
fi

SCRIPT_DIR=`dirname $0`
cd ${SCRIPT_DIR}
echo "Sourcing ./setup-env.sh"
. ./setup-env.sh

for i in `cat empty_dirs.txt` ; do
  if [ ! -d "$i" ] ; then
    echo "mkdir -p $i"
    mkdir -p "$i"
  fi
done

echo "BUILD_ROOT = ${BUILD_ROOT}"
echo "BUILD_OUTPUT_DIR = ${BUILD_OUTPUT_DIR}"
echo "JS_UT_ENABLE = ${JS_UT_ENABLE}"

# run unit test.
if [ "${JS_UT_ENABLE}" == "true" ]; then
  RUN_UT_CMD="${BUILD_ROOT}/docs-web.resources/com.ibm.docs.web.resources/teststools/run_ut.sh"
  echo " ## JavaScript UT is Enabled!"
  echo " ## running unit tests as: ${RUN_UT_CMD} ${JS_UT_SSH_HOST} ${JS_UT_SSH_USERID}"
  chmod a+x ${RUN_UT_CMD}
  ${RUN_UT_CMD} ${JS_UT_SSH_HOST} ${JS_UT_SSH_USERID}
else
  echo " #### JavaScript UT is Disabled!";
fi

if test -d ${BUILD_OUTPUT_DIR}; then
  echo " ## Remove build output directory '${BUILD_OUTPUT_DIR}'"
  rm -rf ${BUILD_OUTPUT_DIR};
fi

mkdir ${BUILD_OUTPUT_DIR}
echo " ## Create build output directory '${BUILD_OUTPUT_DIR}'"

# clean the maven local repository.
if test -d ${MVN_LOCAL_REPO}; then
  echo " ## Remove maven local repository '${MVN_LOCAL_REPO}'"
  rm -rf ${MVN_LOCAL_REPO};
fi

# run the maven build.
MVN_CMD="mvn -Dmaven.repo.local=${MVN_LOCAL_REPO} ${MVN_COLLECT_PII} ${MVN_RPX_BUILD} ${MVN_PSEUDO_BUILD} ${MVN_CUSTOM_OPTIONS} --log-file ${MVN_LOGFILE}"
echo " ## MVN_CMD = '${MVN_CMD}'"
echo " Maven build start time : '$(date +%Y%m%d-%H%M)'"

### TPS: The line below is not behaving the way it was intended, as $? will hold the return code for the 'tee' command
### With this, Jenkins will think maven command completed successfully if the tee command completed successfully
### Maven supports the --log-file parameter, which accomplishes the same task
#${MVN_CMD} clean install 2>&1 | tee ${BUILD_OUTPUT_DIR}/build_${BUILD_TIMESTAMP}.log
${MVN_CMD} clean install

exitCode=$?
echo "maven exitCode '${exitCode}'"

if [ ${exitCode} != 0 ]; then
  if [ -f ${MVN_LOGFILE} ]; then
    # If maven can't run properly (say, JAVA_HOME is not defined correctly), no maven log will be written
    #echo "Build Failed with return code ${exitCode}! Please check ${MVN_LOGFILE}"
    #exit ${exitCode}
    LOG_MSG="Build Failed with return code ${exitCode}! Please check ${MVN_LOGFILE}."
  else
    LOG_MSG="Build Failed with return code ${exitCode}, and Maven generated no log file."
  fi
  echo "${LOG_MSG}"
  exit ${exitCode}
fi

# Create patch
if [ $exitCode -eq 0 ] && [ "${PATCH_ENABLE}" == "true" ]; then
  echo " ## PATCH_ENABLE is Enabled!";
  java -jar ${BUILD_ROOT}/util/com.ibm.docs.fixpack/target/com.ibm.docs.fixpack.jar 2>&1 | tee ${FIXPACK_LOG}
else
  echo " ## PATCH_ENABLE is Disabled!";
fi

# aggregate test report.
mvn surefire-report:report-only

# copy report to build output directory.
if test -d ${BUILD_ROOT}/target/site; then
  echo " ## copy test report to '${BUILD_OUTPUT_DIR}/tests/site'"
  cp -r ${BUILD_ROOT}/target/site ${BUILD_OUTPUT_DIR}/tests
fi

echo "$0 has completed successfully"
