#%define _unpackaged_files_terminate_build 0
%define _source_filedigest_algorithm 1
%define _binary_filedigest_algorithm 1
%define _binary_payload w9.gzdio

%define _llhome /opt/ll
%define _llapps %_llhome/apps
%define _llappdir %_llapps/docsrp
%define _llcronappdir %_llapps/docsrp-cron
%define _appzip %_llapps/DocsProxyFilter.zip
%define _llscripts %_llhome/scripts/docsrp
%define _llcronscripts %_llhome/scripts/docsrp-cron
%define _lljobs %_llcronscripts/jobs.txt
%define _llstart %_llscripts/configureDMZ.py
%define _logs %_llhome/logs/docsrp
%define _installlog %_logs/rpminstall.log
%define _uninstalllog %_logs/rpmuninstall.log
%define _wasdir /opt/IBM/WebSphere/AppServer

Summary: IBMDocs Secure Proxy Server.
Name: SC-DocsProxy-Config
Version: @@@version@@@
Release: @@@timestamp@@@
License: IBM
Group: Applications/System
Requires: OCS-WebSphere-DMZ-Server OCS-Registry-MiddlewareWebSphere OCS-Registry-Docs OCS-Registry-DocsProxy SC-Users-websphere


%description
HCL Docs Secure Proxy server in DMZ. Will do authentication, load balance and route works.

%pre

%posttrans

%post
if [ ! -e %_logs ]; then
   mkdir -p %_logs
   chmod -R 777 %_logs
fi

date > %_installlog

#Install the flip script
cp /opt/ll/scripts/siteflip/F98ActivateStatusTask /etc/rc.d/rc.cf

mkdir -p %_llappdir
mkdir -p %_llcronappdir
cd %_llapps
unzip %_appzip -d %_llappdir

cd %_llscripts
chmod 755 -R %_llscripts
export PYTHONPATH=$PYTHONPATH:$PWD
python %_llstart >> %_installlog 2>&1
RC=$?
#Check the return code
if [ $RC -ne 0 ]; then
   echo "HCL Docs DMZ configuration failed.  Please see /opt/ll/logs/docsrp/rpminstall.log for additional details" >> %_installlog
   exit 1
fi

cd %_llcronscripts
crontab -l >> %_lljobs
crontab %_lljobs

echo "HCL Docs DMZ configuration succeed!" >> %_installlog


%preun

%clean

%files
%defattr(-,root,root)
%doc
%_llhome/scripts
%_llhome/apps


%changelog
