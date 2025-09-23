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
scope="server"
nodeName="docsNode01"
scopeName="serverViewer"
wasInstallPath="/opt/IBM/WebSphere/AppServer_1/profiles/AppSrv01"
wasadminID="wasadmin"
wasadminPW="passw0rd"
soap_port="8879"
mapWebserver="true"
buildDir=".."
export PYTHONPATH=$PYTHONPATH:$PWD
python un_installd.py ${buildDir} ${wasInstallPath} "${wasadminID}" "${wasadminPW}" "${scope}" "${scopeName}" "${nodeName}" "${soap_port}" "${mapWebserver}"
