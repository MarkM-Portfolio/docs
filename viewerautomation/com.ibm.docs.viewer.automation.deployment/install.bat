@echo off

rem scope to be server or cluster
set scope="server"
set nodeName="IBM-POPRNDRVISQNode01"
set scopeName="server1"
set wasInstallPath="c:/Program Files (x86)/IBM/SDP/runtimes/base_v7/"
set wasadminID="wasadmin"
set wasadminPW="wasadmin"
set soap_port="8880"

set mapWebserver="false"
set buildDir=".."

python ./installd.py %buildDir% %wasInstallPath% %wasadminID% %wasadminPW% %scope% %scopeName% %nodeName% %soap_port% %mapWebserver"