#!/bin/bash

if [ `basename -- "$0"` == "setup-env.sh" ]; then
  echo "Sorry, you must run this script like this: '. $0 '"
  exit
fi

##----------- Environment Settings ---------
BUILD_ROOT=`pwd`
EXPORTED="BUILD_ROOT"

BUILD_TOOLS=${BUILD_ROOT}/buildtools
EXPORTED="${EXPORTED} BUILD_TOOLS"

WAS_VERSION=8.5.5.3
EXPORTED="${EXPORTED} WAS_VERSION"

M2_HOME=${BUILD_ROOT}/buildtools/apache-maven-3.2.5
EXPORTED="${EXPORTED} M2_HOME"

ANT_HOME=${BUILD_ROOT}/buildtools/apache-ant-1.9.4
EXPORTED="${EXPORTED} ANT_HOME"

CLASSPATH=${CLASSPATH}:${ANT_HOME}/lib
EXPORTED="${EXPORTED} CLASSPATH"

MAVEN_OPTS="-Xmx1024m"
EXPORTED="${EXPORTED} MAVEN_OPTS"

BUILD_OUTPUT_DIR=${BUILD_ROOT}/Build
EXPORTED="${EXPORTED} BUILD_OUTPUT_DIR"

if [ -z "${JAVA_HOME}" ]; then
  echo "JAVA_HOME not set, use default setting JAVA_HOME=/local1/cnxbuild/Java18IBM";
  JAVA_HOME=/local1/cnxbuild/Java18IBM
else
  echo "JAVA_HOME set, use specified setting";
fi
echo " [${JAVA_HOME}]"
EXPORTED="${EXPORTED} JAVA_HOME"

if [ -z "${NODE_HOME}" ]; then
  echo "NODE_HOME not set, use default setting NODE_HOME=/usr";
  NODE_HOME=/usr
else
  echo "NODE_HOME set, use specified setting";
fi
echo " [${NODE_HOME}]"
EXPORTED="${EXPORTED} NODE_HOME"

PATH=${PATH}:${M2_HOME}/bin:${JAVA_HOME}/bin:${ANT_HOME}/bin:${NODE_HOME}/bin
EXPORTED="${EXPORTED} PATH"

# Set these variables according to your mount point to MLSA2
if [ -z "${FS_MNT}" ]; then
  echo "FS_MNT not set, use default setting FS_MNT=/mnt/mlsa2";
  FS_MNT=/mnt/mlsa2
else
  echo "FS_MNT set, use specified setting";
fi
echo " [${FS_MNT}]"
EXPORTED="${EXPORTED} FS_MNT"

if [ -z "${WORKPLACE_DIR}" ]; then
  echo "WORKPLACE_DIR not set, use default setting WORKPLACE_DIR=${FS_MNT}/workplace";
  WORKPLACE_DIR=${FS_MNT}/workplace
else
  echo "WORKPLACE_DIR set, use specified setting";
fi
echo " [${WORKPLACE_DIR}]"
EXPORTED="${EXPORTED} WORKPLACE_DIR"

if [ -z "${DAILYBUILDS}" ]; then
  echo "DAILYBUILDS not set, use default setting DAILYBUILDS=${WORKPLACE_DIR}/dailybuilds";
  DAILYBUILDS=${WORKPLACE_DIR}/dailybuilds
else
  echo "DAILYBUILDS set, use specified setting";
fi
echo " [${DAILYBUILDS}]"
EXPORTED="${EXPORTED} DAILYBUILDS"

if [ -z "${GOLDBUILDS}" ]; then
  echo "GOLDBUILDS not set, use default setting GOLDBUILDS=${WORKPLACE_DIR}/goldbuilds";
  GOLDBUILDS=${WORKPLACE_DIR}/goldbuilds
else
  echo "GOLDBUILDS set, use specified setting";
fi
echo " [${GOLDBUILDS}]"
EXPORTED="${EXPORTED} GOLDBUILDS"

if [ -z "${SYMPHONY}" ]; then
  echo "SYMPHONY not set, use default setting SYMPHONY=${DAILYBUILDS}/Symphony";
  SYMPHONY=${DAILYBUILDS}/Symphony
else
  echo "SYMPHONY set, use specified setting";
fi
echo " [${SYMPHONY}]"
EXPORTED="${EXPORTED} SYMPHONY"

if [ -z "${JS_UT_ENABLE}" ]; then
  echo "JS_UT_ENABLE not set, use default setting JS_UT_ENABLE=false";
  JS_UT_ENABLE=false
else
  echo "JS_UT_ENABLE set, use specified setting";
fi
echo " [${JS_UT_ENABLE}]"
EXPORTED="${EXPORTED} JS_UT_ENABLE"

# Move the local Maven repo to live within the build area
if [ -z "${prefix}" ]; then
  MVN_LOCAL_REPO="${BUILD_ROOT}/mavenLocalRepo"
else
  MVN_LOCAL_REPO="${BUILD_ROOT}/${prefix}_mavenLocalRepo"
fi

echo "maven local repo: [${MVN_LOCAL_REPO}]"
EXPORTED="${EXPORTED} MVN_LOCAL_REPO"

if [ -z "${BUILD_TIMESTAMP}" ]; then
  echo -n "BUILD_TIMESTAMP not set, use local timestamp";
  BUILD_TIMESTAMP=$(date +%Y%m%d-%H%M)
fi
echo " [${BUILD_TIMESTAMP}]"
EXPORTED="${EXPORTED} BUILD_TIMESTAMP"

if [ -z "${BUILD_VERSION}" ]; then
  echo -n "RTC BUILD_VERSION not set, use local version";
  BUILD_ONPREMISE_VERSION=2.0.2
  BUILD_SMARTCLOUD_VERSION=2.0.2
else
  echo -n "Use RTC BUILD_VERSION";
  BUILD_ONPREMISE_VERSION=${BUILD_VERSION}
  BUILD_SMARTCLOUD_VERSION=${BUILD_VERSION}
fi
echo " [${BUILD_ONPREMISE_VERSION}]"
EXPORTED="${EXPORTED} BUILD_ONPREMISE_VERSION"
EXPORTED="${EXPORTED} BUILD_SMARTCLOUD_VERSION"

if [ -z "${ConversionLibrary_RPATH}" ]; then
  echo -n "Conversion Library path not set, use default setting";
  ConversionLibrary_RPATH=${DAILYBUILDS}/docs_cl_w32
else
  echo -n "Conversion Library path set, use specified version";
fi
echo " [${ConversionLibrary_RPATH}]"
EXPORTED="${EXPORTED} ConversionLibrary_RPATH"

if [ -z "${Linux_ConversionLibrary_RPATH}" ]; then
  echo -n "Linux Conversion Library path not set, use default setting";
  Linux_ConversionLibrary_RPATH=${DAILYBUILDS}/docs_cl_lnx
else
  echo -n "Linux Conversion Library path set, use specified version";
fi
echo " [${Linux_ConversionLibrary_RPATH}]"
EXPORTED="${EXPORTED} Linux_ConversionLibrary_RPATH"

if [ -z "${Artifactory_3rd_Party}" ]; then
  echo -n "Artifactory_3rd_Party path not set, use default setting";
  Artifactory_3rd_Party=https://artifactory.cwp.pnp-hcl.com/artifactory/connections-3rd-party
else
  echo -n "Artifactory_3rd_Party path set, use specified version";
fi
echo " [${Artifactory_3rd_Party}]"
EXPORTED="${EXPORTED} Artifactory_3rd_Party"

if [ -z "${PATCH_ENABLE}" ]; then
  echo "PATCH_ENABLE not set, use default setting PATCH_ENABLE=false";
  PATCH_ENABLE=false
else
  echo "PATCH_ENABLE set, use specified setting";
fi
EXPORTED="${EXPORTED} PATCH_ENABLE"

if [ -z "${PRODUCT_NUMBER}" ]; then
  echo -n "Product Number not set, use default number";
  PRODUCT_NUMBER=CN7ZLML
else
  echo -n "Product Number set, use specified number";
fi
echo " [${PRODUCT_NUMBER}]"
EXPORTED="${EXPORTED} PRODUCT_NUMBER"

if [ -z "${PATCH_BASE_RELPATH}" ]; then
  echo -n "Patch base relpath not set, use default";
  PATCH_BASE_RELPATH=IBMConnectionsDocs_2.0.0
else
  echo -n "Patch base relpath set, use specified path";
fi
echo " [${PATCH_BASE_RELPATH}]"
EXPORTED="${EXPORTED} PATCH_BASE_RELPATH"

MVN_COLLECT_PII="-Dcond.COLLECT_PII"
EXPORTED="${EXPORTED} MVN_COLLECT_PII"

#MVN_RPX_BUILD="-Dcond.RPX_BUILD"
EXPORTED="${EXPORTED} MVN_RPX_BUILD"

#MVN_PSEUDO_BUILD="-Dcond.PSEUDO_BUILD"
EXPORTED="${EXPORTED} MVN_PSEUDO_BUILD"

# use MVN_CUSTOM_OPTION environment var to pass run options to the mvn command
EXPORTED="${EXPORTED} MVN_CUSTOM_OPTIONS"

#RPXIDENTIFY=true
EXPORTED="${EXPORTED} RPXIDENTIFY"


# To-do:  Cleanup logic associated with grabbing dependencies via FTP
if [ -z "${BUILD_FTP_REMOTESERVER}" ]; then
  BUILD_FTP_REMOTESERVER=docsftp0.cnx.cwp.pnp-hcl.com
  EXPORTED="${EXPORTED} BUILD_FTP_REMOTESERVER"
fi
echo "remote ftp server: [${BUILD_FTP_REMOTESERVER}]"

##--- Build Variable set in Build Server ---

# Don't think this is needed, test with the following line commented out
JAVA_HOME=${JAVA_HOME}

if [ -z "${PDEV_ECLIPSE_HOME1}" ]; then
  PDEV_ECLIPSE_HOME1=/local1/cnxbuild/PackageDeveloper409/eclipse
  echo "PDEV_ECLIPSE_HOME1 not set, use default setting of ${PDEV_ECLIPSE_HOME1}";
else
  echo "PDEV_ECLIPSE_HOME1 set, use specified setting";
fi
echo " [${PDEV_ECLIPSE_HOME1}]"
EXPORTED="${EXPORTED} PDEV_ECLIPSE_HOME1"

if [ -z "${PDEV_ECLIPSE_HOME2}" ]; then
  PDEV_ECLIPSE_HOME2=/local1/cnxbuild/PackageDeveloper
  echo "PDEV_ECLIPSE_HOME2 not set, use default setting of ${PDEV_ECLIPSE_HOME2}";
else
  echo "PDEV_ECLIPSE_HOME2 set, use specified setting";
fi
echo " [${PDEV_ECLIPSE_HOME2}]"
EXPORTED="${EXPORTED} PDEV_ECLIPSE_HOME2"

if [ -z "${IM_ECLIPSE_HOME}" ]; then
  IM_ECLIPSE_HOME=/local1/cnxbuild/InstallationManager/eclipse
  echo "IM_ECLIPSE_HOME not set, use default setting of ${IM_ECLIPSE_HOME}";
else
  echo "IM_ECLIPSE_HOME set, use specified setting";
fi
echo " [${IM_ECLIPSE_HOME}]"
EXPORTED="${EXPORTED} IM_ECLIPSE_HOME"

if [ -z "${IM_SHARED_HOME}" ]; then
  IM_SHARED_HOME=/local1/cnxbuild/IBMIMShared
  echo "IM_SHARED_HOME not set, use default setting of ${IM_SHARED_HOME}";
else
  echo "IM_SHARED_HOME set, use specified setting";
fi
echo " [${IM_SHARED_HOME}]"
EXPORTED="${EXPORTED} IM_SHARED_HOME"

if [ -z "${RATIONALSDP_HOME}" ]; then
  RATIONALSDP_HOME=/local1/cnxbuild/rationalsdp
  echo "RATIONALSDP_HOME not set, use default setting ${RATIONALSDP_HOME}";
else
  echo "RATIONALSDP_HOME set, use specified setting";
fi
echo " [${RATIONALSDP_HOME}]"
EXPORTED="${EXPORTED} RATIONALSDP_HOME"

if [ -z "${RTC_BUILD_DIR}" ]; then
  RTC_BUILD_DIR=/local1/cnxbuild/jazz
  echo "RTC_BUILD_DIR not set, use default setting of ${RTC_BUILD_DIR}";
else
  echo "RTC_BUILD_DIR set, use specified setting";
fi
echo " [${RTC_BUILD_DIR}]"
EXPORTED="${EXPORTED} RTC_BUILD_DIR"

if [ -z "${MVN_LOGFILE}" ]; then
  MVN_LOGFILE=${BUILD_OUTPUT_DIR}/maven_${BUILD_TIMESTAMP}.log
  echo "MVN_LOGFILE not set, use default setting of ${MVN_LOGFILE}";
else
  echo "MVN_LOGFILE set, use specified setting";
  echo "WARNING: You've overridden the default value for MVN_LOGFILE, this log file will not be archived to the Jenkins job."
fi
echo " [${MVN_LOGFILE}]"
EXPORTED="${EXPORTED} MVN_LOGFILE"

if [ -z "${FIXPACK_LOG}" ]; then
  FIXPACK_LOG=${BUILD_OUTPUT_DIR}/fixpack_${BUILD_TIMESTAMP}.log
  echo "FIXPACK_LOG not set, use default setting of ${FIXPACK_LOG}";
else
  echo "FIXPACK_LOG set, use specified setting";
  echo "WARNING: You've overridden the default value for FIXPACK_LOG, this log file will not be archived to the Jenkins job."
fi
echo " [${FIXPACK_LOG}]"
EXPORTED="${EXPORTED} FIXPACK_LOG"

echo '--------------------------'
echo '- Setting up environment -'
echo '--------------------------'
for item in ${EXPORTED}; do
  export ${item}
  printf "%25s: %s\n" ${item} "${!item}"
done
echo '--------------------------'

chmod a+x ${M2_HOME}/bin/mvn
chmod a+x ${JAVA_HOME}/bin/java
chmod a+x ${ANT_HOME}/bin/ant
