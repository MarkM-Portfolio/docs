%define _unpackaged_files_terminate_build 0
%define _source_filedigest_algorithm 1
%define _binary_filedigest_algorithm 1
%define _binary_payload w9.gzdio
%define appsDir /opt/ll/apps

Summary: Docs extension artifact for WAS
Name: SC-Docs-Ext
Provides: OCS-Docs-Ext
Version: @@@version@@@
Release: @@@timestamp@@@
License: IBM
Group: Applications/System
Requires: SC-AC-Config

%description
This installs Docs extension 

#-------------------------------------------------------------------------------------------------------------
#The pre macro is for running anything before the install
#-------------------------------------------------------------------------------------------------------------
%pre


#-------------------------------------------------------------------------------------------------------------
#The preun macro is for running anything before the rpm uninstall starts
#-------------------------------------------------------------------------------------------------------------
%preun

#-------------------------------------------------------------------------------------------------------------
#The postun macro is for running anything after the rpm uninstall finishes
#-------------------------------------------------------------------------------------------------------------
%postun

%post
source /root/.bashrc
source /opt/ll/lib/registry/registryLib.sh
source /opt/ll/lib/apache/zookeeper/zooKeeperLib.sh
source /usr/local/ibmsaas_ac.env

getSetting MiddlewareWebSphere admin_username
wasUsername=$REGISTRY_DATA
getSetting MiddlewareWebSphere admin_password
wasPassword=$REGISTRY_DATA

export WAS_ROOT=/opt/IBM/WebSphere/AppServer

shortName=`hostname | cut -d '.' -f1`
hostname=`hostname`
dmHostname=$hostname
##########################################################################################################
time=`date`
echo "DOCS_EXTENSION_DEPLOYMENT_TIME - Started deployment of Docs extensions at $time"
updateActivationStatus "Starting Docs extensions install"
cd /opt/ll/apps/docs/ext

unzip extension.zip

/opt/ll/scripts/docs/ext/configureExtension.sh

/opt/ll/scripts/ac/appendBuildInfo.sh %{name} %{version}-%{release}
updateActivationStatus "Finished Docs extensions install"
time=`date`
echo "DOCS_EXTENSION_DEPLOYMENT_TIME - Finished deployment of extensions at $time"
##########################################################################################################
time=`date`
echo "VIEWER_DEPLOYMENT_TIME - Started configuration of Viewer at $time"
updateActivationStatus "Starting Viewer config"
# cd /opt/ll/apps/docs/viewer

/opt/ll/scripts/docs/viewer/copyXmlFile.sh

/opt/ll/scripts/ac/appendBuildInfo.sh %{name} %{version}-%{release}
updateActivationStatus "Finished Viewer config"
time=`date`
echo "VIEWER_DEPLOYMENT_TIME - Finished configuration of Viewer at $time"

#-------------------------------------------------------------------------------------------------------------
#The clean macro is for cleaning things up after the actual package is built
#-------------------------------------------------------------------------------------------------------------
%clean

#-------------------------------------------------------------------------------------------------------------
#The files macro defines what to actually package in the rpm.  These files are installed as-is on the system
#-------------------------------------------------------------------------------------------------------------
%files
%defattr(-,root,root)
%doc

/opt/ll/scripts/docs/*
/opt/ll/apps/docs/*

#-------------------------------------------------------------------------------------------------------------
#The changelog macro is for commenting on changes made with each RPM revision
#-------------------------------------------------------------------------------------------------------------
%changelog
