[![Build Status](https://jenkins.cwp.pnp-hcl.com/cnx/buildStatus/icon?job=Core%2FDocs%2Fdocs_app)](https://jenkins.cwp.pnp-hcl.com/cnx/job/Core/job/Docs/job/docs_app/)

# ~~IBM~~ HCL Docs

## Developer Builds

#### prerequisites

- IBM JVM
  - [downloads](https://artifactory.cwp.pnp-hcl.com/artifactory/openlyAvailable-utils/Java/)
  - for OS-X use [ibm_macosxx6480sr4fp10hybrid-sdk_20170911.tar.gz](https://artifactory.cwp.pnp-hcl.com/artifactory/openlyAvailable-utils/Java/MacOSX64/1.8/ibm_macosxx6480sr4fp10hybrid-sdk_20170911.tar.gz)

- nodejs v0.10.33
  - there are linux and w32 versions under [viewerapp buildtools](viewerapp/applications/com.ibm.concord.viewer.war/buildtools/nodejs)
  - for other OS, you will need to specify in path

- `uglifyjs`
  - v1.3.5 is needed under `./buildtools/uglifyjs` as it is referenced from [docs-web.resources/com.ibm.docs.web.resources/build.xml#L96](/docs-web.resources/com.ibm.docs.web.resources/build.xml#L96) but it does not exist in source control
  - alternatively it can be installed globally

- env variables (defaults: `./setup-env.sh||.cmd`):
  - `JAVA_HOME` point to your IBM JVM dir
  - `FS_MNT` point to your mlsa2 mount, or local dir if you have the resources existing locally (symphony binaries, conversion library)
  - sample environment variables setup (from my mac):
      ```
      export JAVA_HOME=~/DEV/tools/ibm_macosxx6480sr4fp10hybrid-sdk_20170911
      export ANT_HOME=~/DEV/tools/apache-ant-1.9.14

      # Using node version manager:
      export NODE_HOME=/Users/testrada/.nvm/versions/node/v8.15.1/bin/node
      #export NODE_HOME=/usr/local/bin/node

      #export CLASSPATH=${CLASSPATH}:~/DEV/tools/xalan-j_2_7_1/
      export PATH=${JAVA_HOME}/jre/bin:${ANT_HOME}/bin:$PATH

      export JS_UT_ENABLE=false # for unit tests
      export PATCH_ENABLE=false # for creating ifix patch

      # copied current builds from samba accessed network share mlsa2 locally in order to speed up local builds
      # /Volumes/aws-hcl-cwp-hawkins-mlsa2/workplace/dailybuilds/docs_app/ -> /Users/testrada/DEV/git/ic/docs/mlsa2/workplace/dailybuilds/docs_app/
      # /Volumes/aws-hcl-cwp-hawkins-mlsa2/workplace/dailybuilds/docs_cl_lnx/ -> /Users/testrada/DEV/git/ic/docs/mlsa2/workplace/dailybuilds/docs_cl_lnx/
      # /Volumes/aws-hcl-cwp-hawkins-mlsa2/workplace/dailybuilds/docs_cl_w32/ -> /Users/testrada/DEV/git/ic/docs/mlsa2/workplace/dailybuilds/docs_cl_w32/
      # /Volumes/aws-hcl-cwp-hawkins-mlsa2/workplace/dailybuilds/Symphony/ -> /Users/testrada/DEV/git/ic/docs/mlsa2/workplace/dailybuilds/Symphony/
      # /Volumes/aws-hcl-cwp-hawkins-mlsa2/workplace/goldbuilds/IBMConnectionsDocs* -> /Users/testrada/DEV/git/ic/docs/mlsa2/workplace/goldbuilds/
      export FS_MNT=/Users/testrada/DEV/git/ic/docs/mlsa2
      #export FS_MNT=/Volumes/aws-hcl-cwp-hawkins-mlsa2  # USE LOCAL STATIC COPY AS ABOVE INSTEAD
      export WORKPLACE_DIR=${FS_MNT}/workplace
      export DAILYBUILDS=${WORKPLACE_DIR}/dailybuilds
      export GOLDBUILDS=${WORKPLACE_DIR}/goldbuilds
      export SYMPHONY=${DAILYBUILDS}/Symphony
      export ConversionLibrary_RPATH=${DAILYBUILDS}/docs_cl_w32
      export Linux_ConversionLibrary_RPATH=${DAILYBUILDS}/docs_cl_lnx
      export PATCH_BASE_RELPATH=IBMConnectionsDocs_2.0.0


      # these are used to build deployment projects (only used in pipeline build workspace)
      #export PDEV_ECLIPSE_HOME1=~/DEV/tools/PackageDeveloper409/eclipse
      #export PDEV_ECLIPSE_HOME2=~/DEV/tools/PackageDeveloper
      #export IM_ECLIPSE_HOME=~/DEV/tools/InstallationManager/eclipse
      #export RTC_BUILD_DIR=/local1/cnxbuild/jazz

      # FTP server to get from and push to (get symphone, conversion lib)
      # these are obsolete; the build is now using copy to FS_MNT points instead of ftp get/put
      #export BUILD_FTP_REMOTESERVER=icautomation.cnx.cwp.pnp-hcl.com
      #export ServerADDR=icautomation.cnx.cwp.pnp-hcl.com
      #export BUILD_FTP_USERNAME=conbld
      #export BUILD_FTP_PASSWORD=<***hidden***>

      # for development builds or non supported deployments, skip the deployment project
      #export MVN_CUSTOM_OPTIONS="-V --fail-at-end --projects \"!deployment\" -P devel"
      export MVN_CUSTOM_OPTIONS="-V --fail-at-end --projects \"!deployment\" "
      ```

- unit & e2e tests (uses remote test server via ssh):
  - `JS_UT_ENABLE` (false, disable for now)
  - `JS_UT_SSH_HOST` (used when above is true)
  - `JS_UT_SSH_USERID`

- **no longer used (ftp tasks have been replaced with copy tasks from mlsa2 network share)**
  - ~~`BUILD_FTP_REMOTESERVER` (docsftp0.cnx.cwp.pnp-hcl.com)~~
    - ~~`BUILD_FTP_USERNAME`~~
    - ~~`BUILD_FTP_PASSWORD`~~


#### commands

- `./build.sh` starts build

#### caveats
- if you have global maven installed, it may conflict with this project's maven `./buildtools/apache-maven-<version>` install
- IBM JVM is needed as `com.ibm.misc` is not found in Oracle's JVM
- when tests are enabled, build scripts will run unit tests in a remote server via ssh (see [docs-web.resources/com.ibm.docs.web.resources/teststools/run_ut.sh](/docs-web.resources/com.ibm.docs.web.resources/teststools/run_ut.sh))

- `BUILD_FTP_REMOTESERVER` is used to `get` symphony binaries, conversion libraries
  - build `puts` to ftp server when complete
  - as of https://git.cwp.pnp-hcl.com/ic/docs/pull/11 the ftp has been replaced with copy from directory


## TASKS DURING RELEASE CYCLES


### External Dependencies

There are a number of artifacts (jars) that are copied statically from external sources.  Since there is no automated process for retrieving and keeping these resources updated to latest compatible levels, one must check each one and update them or create new version of them internally under ./buildtools/mavenRepository

- [ ] [com.ibm.connections.directory.services](./buildtools/mavenRepository/com/ibm/com.ibm.connections.directory.services)
- [ ] [lc.util.web](./buildtools/mavenRepository/com/ibm/lc.util.web) _note that although the version on the file name has remained as 3.0 (eg. lc.util.web-3.0.jar), the internal classes were updated in the connections version_

**NOTE: this is a WIP list.  as we find more, add them above**


## origin (RTC)

for reference, this is the repository structure in RTC from where these files were transferred:

[![components](origin/RTC%20Docs%20On-prem_2.0_CR3%20components.png)](https://swgjazz.ibm.com:8026/jazz/web/projects/LotusLive%20Symphony%20-%20streams%20only#action=com.ibm.team.scm.browseWorkspace&id=_fEG00B9_EeqVu_wyjFm4cg)

[![concord_base](origin/RTC%20Docs%20On-prem_2.0_CR3%20concord_base.png)](https://swgjazz.ibm.com:8026/jazz/web/projects/LotusLive%20Symphony%20-%20streams%20only#action=com.ibm.team.scm.browseElement&workspaceItemId=_fEG00B9_EeqVu_wyjFm4cg&componentItemId=_cxIzMEWzEeCi-JH9Xu32Zw&path=/)

[![viewer_base](origin/RTC%20Docs%20On-prem_2.0_CR3%20viewer_base.png)](https://swgjazz.ibm.com:8026/jazz/web/projects/LotusLive%20Symphony%20-%20streams%20only#action=com.ibm.team.scm.browseElement&workspaceItemId=_fEG00B9_EeqVu_wyjFm4cg&componentItemId=_oy5ZMD0qEeGoVPuKCrGAfw&path=/)

[![conversion_base](origin/RTC%20Docs%20On-prem_2.0_CR3%20conversion_base.png)](https://swgjazz.ibm.com:8026/jazz/web/projects/LotusLive%20Symphony%20-%20streams%20only#action=com.ibm.team.scm.browseElement&workspaceItemId=_fEG00B9_EeqVu_wyjFm4cg&componentItemId=_SVCywGLfEeGWwf6X-L5LHw&path=/)

note:  `sanity_base` imported to a separate repo -> https://git.cwp.pnp-hcl.com/ic/docs-automation#origin-rtc


# How to build Docs locally using docker image
- pull docs docker image </br>
 docker pull buildutils-docker.artifactory.cwp.pnp-hcl.com/docs_app-build:latest
- mount MLSA2</br>
mount -t smbfs //'sgw-E713F48E;smbguest':connections@10.190.161.197/aws-hcl-cwp-hawkins-mlsa2 /Users/olgarueckert/mnt

- run docker image as follows</br>
docker run -t -d -u 1001:1001 -v /Users/olgarueckert/mnt:/mnt/mlsa2 -v /Users/olgarueckert/code/ic/docs:/local1/cnxbuild/docs_app:rw,z -v /Users/olgarueckert/code/ic/docs@tmp:/local1/cnxbuild/docs_app@tmp:rw,z buildutils-docker.artifactory.cwp.pnp-hcl.com/docs_app-build:latest cat

- ssh into docs container</br>  
docker exec -it 79efc491f370 /bin/bash</br>
cd /local1/cnxbuild/docs_app</br>
. ./setup-env.sh</br>
./build.sh</br>
tail -f /local1/cnxbuild/docs_app/Build/maven<timestamp>.log</br>
