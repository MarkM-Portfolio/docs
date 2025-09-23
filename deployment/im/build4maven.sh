#
#BUILD_HOME=$LWP_HOME/ConcordInstaller_IM
#BUILD_OUTPUT=$LWP_HOME/im.output
#if [ ! -d "$BUILD_OUTPUT" ]; then
#  mkdir "$BUILD_OUTPUT"
#fi

#PDEV_ECLIPSE_HOME1=/opt/IBM/pdev.standalone.linux.gtk.x86_4.0.9.20130812_1137/eclipse
#PDEV_ECLIPSE_HOME2=/opt/IBM/PackageDeveloper
#IM_ECLIPSE_HOME=/opt/IBM/InstallationManager/eclipse
#VERSION=1.0.7

#export ANT_HOME=/root/software/build/ant1.7
#export PATH=$PATH:$ANT_HOME/bin
#export CLASSPATH=$CLASSPATH:$ANT_HOME/lib

echo "BUILD_OUTPUT = ${BUILD_OUTPUT}"
echo "BUILD_HOME = ${BUILD_HOME}"
echo "IM_ECLIPSE_HOME = ${IM_ECLIPSE_HOME}"
echo "PDEV_ECLIPSE_HOME1 = ${PDEV_ECLIPSE_HOME1}"
echo "PDEV_ECLIPSE_HOME2 = ${PDEV_ECLIPSE_HOME2}"
echo "JAVA_HOME = ${JAVA_HOME}"
echo "ANT_HOME = ${ANT_HOME}"

#rm -rf ${BUILD_OUTPUT}/../im.output
mkdir -p ${BUILD_OUTPUT}/pde.build/features ${BUILD_OUTPUT}/pde.build/plugins ${BUILD_OUTPUT}/im.build
cp -rf ${BUILD_HOME}/for.pde.build/* ${BUILD_OUTPUT}/pde.build
cp -rf ${BUILD_HOME}/com.ibm.docs.installer ${BUILD_OUTPUT}/im.build

dos2unix ${BUILD_OUTPUT}/pde.build/build.properties
sed -i "s~^base=$~base=${IM_ECLIPSE_HOME}/..~" ${BUILD_OUTPUT}/pde.build/build.properties
sed -i "s~^buildDirectory=$~buildDirectory=${BUILD_OUTPUT}/pde.build~" ${BUILD_OUTPUT}/pde.build/build.properties
#sed -i "s~^JRELocations$~JavaSE-1.6=${IM_ECLIPSE_HOME}/jre_6.0.0.sr9_20110208_03/jre/lib/rt.jar;${IM_ECLIPSE_HOME}/jre_6.0.0.sr9_20110208_03/jre/lib/amd64/default/jclSC160/vm.jar;${IM_ECLIPSE_HOME}/jre_6.0.0.sr9_20110208_03/jre/lib/java.util.jar~" ${BUILD_OUTPUT}/pde.build/build.properties

cp -rf ${BUILD_HOME}/com.ibm.docs.installer.feature ${BUILD_OUTPUT}/pde.build/features
cp -rf ${BUILD_HOME}/com.ibm.docs.im.* ${BUILD_OUTPUT}/pde.build/plugins

${PDEV_ECLIPSE_HOME1}/eclipse \
-application org.eclipse.ant.core.antRunner -nosplash \
-buildfile ${BUILD_OUTPUT}/pde.build/build_pde.xml \
-DPDEV_ECLIPSE_HOME=${PDEV_ECLIPSE_HOME1}

if [ ! -d "${BUILD_OUTPUT}/pde.build/tmp/eclipse/plugins" ]; then
  echo "PDEV_ECLIPSE_HOME1 build failed!"
  exit 1
fi

cp -rf ${BUILD_OUTPUT}/pde.build/tmp/eclipse/plugins/* ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/files
cp -rf ${BUILD_OUTPUT}/pde.build/tmp/eclipse/plugins ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/files

#ant -buildfile ${BUILD_HOME}/getConvZip.xml -DDOWNLOAD_HOME=${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/ -DServerADDR=$1 -DUserName=$2 -DPassWord=$3
#ant -buildfile ${BUILD_HOME}/getDocsZip.xml -DDOWNLOAD_HOME=${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/ -DServerADDR=$1 -DUserName=$2 -DPassWord=$3
#ant -buildfile ${BUILD_HOME}/getViewerZip.xml -DDOWNLOAD_HOME=${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/ -DServerADDR=$1 -DUserName=$2 -DPassWord=$3

#cp ${BUILD_HOME}/component.zips/*.zip ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/

for file in ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/native/*.zip
do
  echo "file = ${file}"
  mv $file ${file%.zip}_${VERSION}.zip
done

cd ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer
for file in com.ibm.docs.im.installer.content.shu com.ibm.docs.im.installer.off com.ibm.docs.im.installer.main.asy
do
  sed -i -e "s/__VERSION__/${VERSION}/g" ./$file
done
cd -

echo "PDEV_ECLIPSE_HOME2 = ${PDEV_ECLIPSE_HOME2}"
echo "BUILD_OUTPUT = ${BUILD_OUTPUT}"
echo "VERSION = ${VERSION}"
echo "JAVA_HOME = ${JAVA_HOME}"
echo "ANT_HOME = ${ANT_HOME}"

# /local1/cnxbuild/PackageDeveloper/eclipse \
# -application org.eclipse.ant.core.antRunner -nosplash \
# -buildfile /local1/cnxbuild/JSConnjenk/workspace/Docs/docs_app/deployment/im/target/im.build/com.ibm.docs.installer/build.xml \
# -DBUILD_OUTPUT=/local1/cnxbuild/JSConnjenk/workspace/Docs/docs_app/deployment/im/target \
# -DVERSION=2.0.0

ls -al ${PDEV_ECLIPSE_HOME2}/eclipse
ls -al ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/build.xml

cd ${PDEV_ECLIPSE_HOME2}
for file in eclipse.ini pdevbuild.ini
do
  sed -i -e "s~__PDEV_ECLIPSE_HOME2__~${PDEV_ECLIPSE_HOME2}~g" ./$file
done
cd -

cat ${PDEV_ECLIPSE_HOME2}/eclipse.ini
cat ${PDEV_ECLIPSE_HOME2}/pdevbuild.ini

cd ${PDEV_ECLIPSE_HOME2}/configuration
for file in config.ini
do
  sed -i -e "s~__PDEV_ECLIPSE_HOME2__~${PDEV_ECLIPSE_HOME2}~g" ./$file
  sed -i -e "s~__RATIONALSDP_HOME__~${RATIONALSDP_HOME}~g" ./$file
  sed -i -e "s~__IM_SHARED_HOME__~${IM_SHARED_HOME}~g" ./$file
done
cd -

cat ${PDEV_ECLIPSE_HOME2}/configuration/config.ini

cd ${PDEV_ECLIPSE_HOME2}/configuration/org.eclipse.equinox.simpleconfigurator
for file in bundles.info
do
  sed -i -e "s~__IM_SHARED_HOME__~${IM_SHARED_HOME}~g" ./$file
done
cd -

cat ${PDEV_ECLIPSE_HOME2}/configuration/org.eclipse.equinox.simpleconfigurator/bundles.info

${PDEV_ECLIPSE_HOME2}/eclipse \
-application org.eclipse.ant.core.antRunner -nosplash \
-buildfile ${BUILD_OUTPUT}/im.build/com.ibm.docs.installer/build.xml \
-DBUILD_OUTPUT=${BUILD_OUTPUT} \
-DVERSION=${VERSION}

exitCode=$?

if [ $exitCode != 0 ]
then
  echo "PDEV_ECLIPSE_HOME2 build failed with exit code ${exitCode} !"
  exit ${exitCode}
fi
