#!/bin/sh
# ***************************************************************** 
#                                                                   
# HCL Confidential                                                  
#                                                                   
# OCO Source Materials                                              
#                                                                   
# Copyright HCL Technologies Limited 2022                           
#                                                                   
# The source code for this program is not published or otherwise    
# divested of its trade secrets, irrespective of what has been      
# deposited with the U.S. Copyright Office.                         
#                                                                   
# ***************************************************************** 
          

source /opt/ll/lib/registry/registryLib.sh 
#export BUILD_HOME="/opt/ll/apps/ac/migrations"
export OS=Linux

getSetting MiddlewareDB2 default_database_directory
dbBaseDir=$REGISTRY_DATA

getSetting AC db_docs
dbDocs=$REGISTRY_DATA
getSetting AC database_instance_username
db2Username=$REGISTRY_DATA
source /usr/local/ibmsaas_ac.env
source /home/${db2Username}/.bashrc

#check to see if database exists, if it does not, create it
db2 connect to ${dbDocs}
result=$?
if [ ${result} -ne 0 ] ; then
    DATABASE_FULLPATH=${dbBaseDir}/${dbDocs}
    INACTIVE_LOGS_PATH=${dbBaseDir}/inactive_logs
    INACTIVE_LOGS_FULLPATH=${INACTIVE_LOGS_PATH}/${dbDocs}
    mkdir -p $DATABASE_FULLPATH
    mkdir -p $INACTIVE_LOGS_FULLPATH
    #db2 CREATE DATABASE ${dbDocs} USING CODESET UTF-8 TERRITORY US
    db2 create db ${dbDocs} on ${DATABASE_FULLPATH} using codeset UTF-8 territory US collate using system
    db2 connect to ${dbDocs}
    db2 revoke connect,createtab,bindadd,implicit_schema on database from public
    db2 alter tablespace syscatspace no file system caching
    db2 alter tablespace tempspace1 no file system caching
    db2 alter tablespace userspace1 no file system caching
    db2 update db cfg for ${dbDocs} using logretain on
    db2 update db cfg for ${dbDocs} using trackmod on
    db2 update db cfg for ${dbDocs} using logarchmeth1 disk:${INACTIVE_LOGS_FULLPATH}
    db2 update db cfg for ${dbDocs} using logindexbuild on
    db2 backup db ${dbDocs} to ${DATABASE_FULLPATH}
    rm ${DATABASE_FULLPATH}/*.001
fi

