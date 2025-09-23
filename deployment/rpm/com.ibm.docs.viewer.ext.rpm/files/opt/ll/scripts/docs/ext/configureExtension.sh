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
    
echo "Remove existing extension and provision jar files"
rm -rf ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/docs.daemon
rm -rf ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/viewer.gatekeeper
rm -f ${LocalFS}/provision/webresources/com.ibm.concord.*.jar

echo "Copy viewer webresources to the webresources directory"
chown websphere:websphere /opt/ll/apps/docs/ext/provision.web/*
mkdir -p ${LocalFS}/provision/webresources
chown -R websphere:websphere ${LocalFS}/provision
/bin/cp /opt/ll/apps/docs/ext/provision.web/* ${LocalFS}/provision/webresources/.
chown websphere:websphere ${LocalFS}/provision/webresources/com.ibm.concord.*.jar

echo "Copy daemon binaries"
chown websphere:websphere /opt/ll/apps/docs/ext/daemon/*
mkdir -p ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/docs.daemon/
chown websphere:websphere ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/docs.daemon
/bin/cp /opt/ll/apps/docs/ext/daemon/* ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/docs.daemon/.
chown websphere:websphere ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/docs.daemon/*

echo "Copy viewer gatekeeper binaries"
chown websphere:websphere /opt/ll/apps/docs/ext/gatekeeper/*
mkdir -p ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/viewer.gatekeeper/
chown websphere:websphere ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/viewer.gatekeeper
/bin/cp /opt/ll/apps/docs/ext/gatekeeper/* ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/viewer.gatekeeper/.
chown websphere:websphere ${WAS_ROOT}/optionalLibraries/IBM/LotusLive/viewer.gatekeeper/*
