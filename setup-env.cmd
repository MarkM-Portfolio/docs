@ECHO OFF
IF "%JAVA_HOME_WAS%" == "" (
  echo No JAVA_HOME_WAS set, please set it in your environment.
  goto :EOF
)
@ECHO ON
set BUILD_ROOT=%CD%
set BUILD_TOOLS=%BUILD_ROOT%\buildtools
set WAS_VERSION=8.5.5.3
set BUILD_TIMESTAMP=%DATE:~-4%%DATE:~-10,-8%%DATE:~-7,-5%-%TIME:~0,2%%TIME:~3,2%
REM set JAVA_HOME=%BUILD_TOOLS%\WebSphere\java
set JAVA_HOME=%JAVA_HOME_WAS%
set M2_HOME=%BUILD_TOOLS%\apache-maven-3.2.5
set ANT_HOME=%BUILD_TOOLS%\apache-ant-1.9.4
set CLASSPATH=%CLASSPATH%;%ANT_HOME%\lib
set MAVEN_OPTS=-Xmx1024m
set PATH=%PATH%;%JAVA_HOME%\bin;%M2_HOME%\bin;%ANT_HOME%\bin
set BUILD_ONPREMISE_VERSION=1.0.7
set BUILD_SMARTCLOUD_VERSION=1.3.7
set ConversionLibrary_RPATH=daily/ConversionLib/ConversionLibrary-Main
set Linux_ConversionLibrary_RPATH=daily/ConversionLib_Linux/ConversionLibrary-Main-Linux
set Artifactory_3rd_Party=https://artifactory.cwp.pnp-hcl.com/artifactory/connections-3rd-party
set BUILD_FTP_REMOTESERVER=docsftp0.cnx.cwp.pnp-hcl.com
set BUILD_FTP_USERNAME=
set BUILD_FTP_PASSWORD=
set JS_UT_SSH_HOST=
set JS_UT_SSH_USERID=
