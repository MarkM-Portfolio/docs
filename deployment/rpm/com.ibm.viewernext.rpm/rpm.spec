#%define _unpackaged_files_terminate_build 0
%define _source_filedigest_algorithm 1
%define _binary_filedigest_algorithm 1
%define _binary_payload w9.gzdio

%define _llhome /opt/ll
%define _llapps %_llhome/apps
%define _llappfolder ViewerNext/rpm
%define _llapp %_llapps/%_llappfolder
#%define _ear IBMConversion
#%define _pluginsroot /opt/WAS/AppServerND/plugins
%define _logs %_llapp/logs
%define _installlog %_logs/install.log
%define _uninstalllog %_logs/uninstall.log

Summary: IBM ViewerNext RPM
Name: SC-ViewerNext-Config
Version: @@@version@@@
Release: @@@timestamp@@@
License: IBM
Group: Applications/System
Requires:OCS-NFS-Client-Config-Utils OCS-WebSphere-Server-Utils OCS-ZooKeeper-Client OCS-Registry-AC OCS-Registry-Docs OCS-Registry-ViewerNext SC-JournalCommon SC-Users-websphere SC-AC-Config-Lib-Scripts-JVMSplitHelper ImageMagick libSM(x86-32) gtk2 gtk2(x86-32) glibc(x86-32) xorg-x11-server-Xvfb
#OCS-DeployTools OCS-Settings OCS-Shell OCS-Was70Upgrade OCS-Symphony-Soffice OCS-Symphony-Base

%description
This installs IBM ViewerNext

%pre

%posttrans

%post
#add zookeeper code

#
cd %_llapp
unzip ViewerNext.zip

#Install the flip script
cp /opt/ll/apps/ViewerNext/rpm/scripts/siteflip/F00ConfigViewerNextLinux.py /etc/rc.d/rc.cf

cd Viewer/installer
python viewer/installLinuxViewerNext.py

%preun

%postun

rm -fr /opt/ll/apps/Viewer
rm -fr /opt/ll/apps/Conversion
cd /opt/IBM/IBMViewer/installer
python viewer/uninstallLinuxViewerNext.py

%clean

%files
%defattr(-,root,root)
%doc

#%_llapps/files
#%_llapp/config
%_llapp/scripts
%_llapp/ViewerNext.zip


%changelog
