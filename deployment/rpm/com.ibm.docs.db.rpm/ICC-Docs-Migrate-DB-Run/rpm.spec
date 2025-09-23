%define _unpackaged_files_terminate_build 0
%define _source_filedigest_algorithm 1
%define _binary_filedigest_algorithm 1
%define _binary_payload w9.gzdio

%define lldir /opt/ll
%define logdir %{lldir}/logs/%{name}
%define version  @@@version@@@
%define revision  @@@revision@@@

%define rpmdb /etc/ll/.rpmdb
%define rpmvars %{rpmdb}/%{name}
%define transactionvars %{rpmdb}/transaction

Summary: Docs DB migration for SmartCloud
Name: ICC-Docs-Migrate-DB-Run
Version: @@@version@@@
Release: @@@timestamp@@@
License: IBM
Group: Applications/System
Requires: python OCS-ZooKeeper-Client SC-AC-Docs-DB-Media
%description
This creates tables and schemas for Docs

#-------------------------------------------------------------------------------------------------------------
#The description macro is for including information in the rpm header
#-------------------------------------------------------------------------------------------------------------
%description
This RPM installs WebSphere Node 64-bit server version %{version} 

#-------------------------------------------------------------------------------------------------------------
#The prep macro is for unpacking the sources and performing any actions required before the install
#-------------------------------------------------------------------------------------------------------------
%prep



#-------------------------------------------------------------------------------------------------------------
#The build macro is for performing the actual build.  This section does not contain macros
#-------------------------------------------------------------------------------------------------------------
%build
find . -name \*.pyc | xargs rm -f
find . -name \*.pyo | xargs rm -f


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


#Make the RPM database directory
if [ ! -e %{rpmdb} ]; then
   mkdir -p %{rpmdb}
fi

rm -rf %{transactionvars}
echo -n >%{transactionvars}
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
source /root/.bashrc
source /opt/ll/lib/registry/registryLib.sh
getSetting "AC" "database_instance_username"
database_instance_username=$REGISTRY_DATA

#Ensure ZooKeeper does not have duplicate entries
python /opt/ll/scripts/ac/deactivate.py >/dev/null 2>&1

#Generate the property file
python /opt/ll/scripts/docs/migrations/generatePropertyFile.py --propertyFile=/tmp/docsdb.properties >>%{logdir}/rpminstall.log 2>&1
RC=$?
#Check the return code
if [ $RC -ne 0 ]; then
   echo "Docs database migration failed.  Error while generating the property file.  Please see %{logdir}/rpminstall.log for additional details"
   exit 1
fi

#Ensure the migration framework has the proper permissions to execute
chown -R $database_instance_username %{logdir}

#Run the migration framework
su -l -c "python /opt/ll/scripts/docs/migrations/migrateDocsDatabase.py --quiet --propertyFile=/tmp/docsdb.properties --logDir=%{logdir}/%{revision}" $database_instance_username >>%{logdir}/rpminstall.log 2>&1
RC=$?
#Check the return code
if [ $RC -ne 0 ]; then
   echo "Docs database migration failed.  Error while running the migration framework.  Please see %{logdir}/rpminstall.log for additional details"
   exit 1
fi

#Activate the server in ZooKeeper
python /opt/ll/scripts/ac/activate.py >>%{logdir}/rpminstall.log 2>&1
RC=$?
#Check the return code
if [ $RC -ne 0 ]; then
   echo "Docs database migration failed.  Error while activating server in ZooKeeper.  Please see %{logdir}/rpminstall.log for additional details"
   exit 1
fi


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
%defattr(755,root,root)
%doc
/opt/ll/scripts/docs

#-------------------------------------------------------------------------------------------------------------
#The changelog macro is for commenting on changes made with each RPM revision
#-------------------------------------------------------------------------------------------------------------
%changelog

