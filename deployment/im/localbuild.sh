export BUILD_HOME=.
#exit

export ANT_HOME=/root/software/build/ant1.7
export PATH=$PATH:$ANT_HOME/bin
export CLASSPATH=$CLASSPATH:$ANT_HOME/lib

PDEV_ECLIPSE_HOME=/root/software/pdev.standalone.linux.gtk.x86_4.0.9.20130812_1137/eclipse
#IM_ECLIPSE_HOME=/opt/IBM/InstallationManager/eclipse
IM_ECLIPSE_HOME=/local1/cnxbuild/InstallationManager/eclipse
BUILD_OUTPUT=/root/software/build/im.output
VERSION=1.0.7


rm -rf ${BUILD_OUTPUT}/../im.output
mkdir -p ${BUILD_OUTPUT}/pde.build/features ${BUILD_OUTPUT}/pde.build/plugins ${BUILD_OUTPUT}/im.build
cp -rf ${BUILD_HOME}/for.pde.build/* ${BUILD_OUTPUT}/pde.build
cp -rf ${BUILD_HOME}/com.ibm.docs.installer ${BUILD_OUTPUT}/im.build

dos2unix ${BUILD_OUTPUT}/pde.build/build.properties
sed -i "s~^base=$~base=${IM_ECLIPSE_HOME}/..~" ${BUILD_OUTPUT}/pde.build/build.properties
sed -i "s~^buildDirectory=$~buildDirectory=${BUILD_OUTPUT}/pde.build~" ${BUILD_OUTPUT}/pde.build/build.properties
sed -i "s~^JRELocations$~JavaSE-1.6=${PDEV_ECLIPSE_HOME}/jdk/jre/lib/rt.jar;${PDEV_ECLIPSE_HOME}/jdk/jre/lib/vm.jar;${PDEV_ECLIPSE_HOME}/jdk/jre/lib/java.util.jar~" ${BUILD_OUTPUT}/pde.build/build.properties

cp -rf ${BUILD_HOME}/com.ibm.docs.installer.feature ${BUILD_OUTPUT}/pde.build/features
cp -rf ${BUILD_HOME}/com.ibm.docs.im.* ${BUILD_OUTPUT}/pde.build/plugins

${PDEV_ECLIPSE_HOME}/eclipse \
-application org.eclipse.ant.core.antRunner -nosplash \
-buildfile ${BUILD_OUTPUT}/pde.build/build_pde.xml \
-DPDEV_ECLIPSE_HOME=${PDEV_ECLIPSE_HOME}

if [ ! -d "${BUILD_OUTPUT}/pde.build/tmp/eclipse/plugins" ]; then
  exit
fi

cp -rf ${BUILD_OUTPUT}/pde.build/tmp/eclipse/plugins/* ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/files
cp -rf ${BUILD_OUTPUT}/pde.build/tmp/eclipse/plugins ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/files


ant -buildfile ${BUILD_HOME}/getConvZip.xml -DDOWNLOAD_HOME=${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/
ant -buildfile ${BUILD_HOME}/getDocsZip.xml -DDOWNLOAD_HOME=${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/
ant -buildfile ${BUILD_HOME}/getViewerZip.xml -DDOWNLOAD_HOME=${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/

#cp ${BUILD_HOME}/component.zips/*.zip ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/

for file in ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/*.zip
do
  mv $file ${file%.zip}_${VERSION}.zip
done

${PDEV_ECLIPSE_HOME}/eclipse \
-application org.eclipse.ant.core.antRunner -nosplash \
-buildfile ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/build.xml \
-DBUILD_OUTPUT=${BUILD_OUTPUT} \
-DVERSION=${VERSION}




