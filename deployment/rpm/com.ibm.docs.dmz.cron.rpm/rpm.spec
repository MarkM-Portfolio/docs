#%define _unpackaged_files_terminate_build 0

%define _source_filedigest_algorithm 1
%define _binary_filedigest_algorithm 1
%define _binary_payload w9.gzdio

%define _llhome /opt/ll
%define _llscripts %_llhome/scripts/docsrp-cron
%define _llapps %_llhome/apps/docsrp-cron
%define _llstart %_llscripts/updateDMZ.py
%define _lljobs %_llscripts/jobs.txt
%define _logs %_llhome/logs/docsrp-cron
%define _installlog %_logs/rpminstall.log
%define _uninstalllog %_logs/rpmuninstall.log
%define _wasdir /opt/IBM/WebSphere/AppServer

Summary: IBMDocs Secure Proxy Server Updater.
Name: SC-DocsProxy-Config-Update
Version: @@@version@@@
Release: @@@timestamp@@@
License: IBM
Group: Applications/System
Requires: SC-DocsProxy-Config


%description
HCL Docs Secure Proxy server updater in DMZ. Will check and update targetTree.xml on DMZ.

%pre

%posttrans

%post
if [ ! -e %_logs ]; then
   mkdir -p %_logs
   chmod -R 777 %_logs
fi

if [ ! -e %_llapps ]; then
   mkdir -p %_llapps
   chmod -R 755 %_llapps
fi

date > %_installlog

cd %_llscripts
chmod 755 -R %_llscripts
export PYTHONPATH=$PYTHONPATH:$PWD
crontab -l >> %_lljobs
crontab %_lljobs
RC=$?
#Check the return code
if [ $RC -ne 0 ]; then
   echo "HCL Docs DMZ updater configuration failed.  Please see /opt/ll/logs/docsrp-cron/rpminstall.log for additional details" >> %_installlog
   exit 1
fi

echo "HCL Docs DMZ updater configuration succeed!" >> %_installlog


%preun

%clean

%files
%defattr(-,root,root)
%doc
%_llscripts
%_llapps


%changelog
