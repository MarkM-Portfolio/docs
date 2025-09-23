%define _unpackaged_files_terminate_build 0
%define _source_filedigest_algorithm 1
%define _binary_filedigest_algorithm 1
%define _binary_payload w9.gzdio
%define __os_install_post %{nil}
%define debug_package %{nil}

%define name SC-TAM-WebSEAL-Config-ViewerNext
%define version @@@version@@@
%define release @@@revision@@@

%define lldir /opt/ll
%define logdir %{lldir}/logs/%{name}

Summary: WebSEAL Config for ViewerNext %{version}
Name: %{name}
Version: %{version}
Release: %{release}

License: IBM
Group: Applications/System

Requires: tar, gzip, zip, unzip, python, OCS-TAM-WebSEAL-Server-Config
ExclusiveOS: linux
AutoReqProv: no

#-------------------------------------------------------------------------------------------------------------
#The description macro is for including information in the rpm header
#-------------------------------------------------------------------------------------------------------------
%description
This RPM installs x version %{version}

#-------------------------------------------------------------------------------------------------------------
#The ppretrans macro is for running anything before the entire transaction
#-------------------------------------------------------------------------------------------------------------
%pretrans

echo "Logs for %{name} can be found in %{logdir}"

#Make the log directory
if [ ! -e %{logdir} ]; then
   mkdir -p %{logdir}
   chmod -R 777 %{logdir}
fi
echo -n >%{logdir}/rpminstall.log
echo -n >%{logdir}/rpmuninstall.log


#-------------------------------------------------------------------------------------------------------------
#The pre macro is for running anything before the install
#-------------------------------------------------------------------------------------------------------------
%pre


#-------------------------------------------------------------------------------------------------------------
#The post macro is for running anything after the install
#-------------------------------------------------------------------------------------------------------------
%post

#Add the AC ACLs
cd /opt/ll/scripts/tam/V6.1/websealserver
python addACLs.py --aclFile /opt/ll/media/viewernext/webseal/viewernext-pdadmin.acl

#Add the AC dynurls
python addDynUrls.py --dynUrlFile /opt/ll/media/viewernext/webseal/viewernext-dynurl.conf


#-------------------------------------------------------------------------------------------------------------
#The preun macro is for running anything before the rpm uninstall starts
#-------------------------------------------------------------------------------------------------------------
%preun


#-------------------------------------------------------------------------------------------------------------
#The postun macro is for running anything after the rpm uninstall finishes
#-------------------------------------------------------------------------------------------------------------
%postun


#-------------------------------------------------------------------------------------------------------------
#The posttrans macro is for running anything after the entire transaction
#-------------------------------------------------------------------------------------------------------------
%posttrans


#-------------------------------------------------------------------------------------------------------------
#The clean macro is for cleaning things up after the actual package is built
#-------------------------------------------------------------------------------------------------------------
%clean


#-------------------------------------------------------------------------------------------------------------
#The files macro defines what to actually package in the rpm.  These files are installed as-is on the system
#-------------------------------------------------------------------------------------------------------------
%files
%defattr(755,ivmgr,ivmgr)

/opt/ll/media/viewernext/webseal

%doc


#-------------------------------------------------------------------------------------------------------------
#The changelog macro is for commenting on changes made with each RPM revision
#-------------------------------------------------------------------------------------------------------------
%changelog
* Mon Apr 19 2010 Zheng Fan <cdlzfan@cn.ibm.com>
- Initial build

