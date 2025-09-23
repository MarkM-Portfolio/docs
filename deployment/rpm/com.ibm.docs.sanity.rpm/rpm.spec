%define _source_filedigest_algorithm 1
%define _binary_filedigest_algorithm 1
%define _binary_payload w9.gzdio
%define _llhome /opt/ll
%define _llapps %_llhome/apps
%define _llappfolder IBMDocs/rpm
%define _llapp %_llapps/%_llappfolder
%define _logs %_llapp/logs
%define _installlog %_logs/install.log
%define _uninstalllog %_logs/uninstall.log

Summary: IBM Docs Sanity RPM
Name: SC-Docs-Sanity-Config
Version: @@@version@@@
Release: @@@timestamp@@@
License: IBM
Group: Applications/System
Requires:SC-Docs-Config OCS-WebSphere-Server-Utils OCS-ZooKeeper-Client OCS-Registry-AC OCS-Registry-Docs SC-Users-websphere

%description
This installs IBM Docs Sanity

%pre

%posttrans

%post

#
cd %_llapp
cd scripts_sanity

export PYTHONPATH=$PYTHONPATH:$PWD
python install_sanity.py 



%preun



%clean

%files
%defattr(-,root,root)
%doc

%_llapp/scripts_sanity
%_llapp/com.ibm.docs.sanity.ear


%changelog
