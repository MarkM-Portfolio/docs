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


usage()
{
	cat << EOM
install.sh [OPTION]

Options
    -configFile <file>         Specifies the configuration file.
                               cfg.properties in current directory is used if none specified.
    -build <directory>         Specifies the location of the product binaries
                               The folder that contains current folder is used if none specified.
    -wasadminID <name>         Specifies the user name of the WebSphere Application Server administrator.
                               Prompted during installation if none specified.
    -wasadminPW <pwd>          Specifies the password of the WebSphere Application Server administrator.
                               Prompted during installation if none specified.
    -acceptLicense             Specifies that license is accepted automatically.
                               Prompted during installation if not specified.
    -mapWebserver <true/false> Set it to be true only if there's one IBM HTTP Server 
                               in front of Viewer Cluster.               
EOM
	exit 1
}

missingOption()
{
    echo The value for \"$1\" does not exist. Check the value for errors and try again.
    usage
}

cfgFile="./cfg.properties"
buildDir="../"
wasadminID=""
wasadminPW=""
acceptLicense="false"
mapWebserver="false"

while [ "$1" != "" ]
do
	case $1 in
		-configFile)
		    if [ "$2" == "" ] || [ "${2:0:2}" == "-" ] 
		    then
		      missingOption $1
		    fi	
		    cfgFile=$2
			shift 2;;
		-build)
            if [ "$2" == "" ] || [ "${2:0:2}" == "-" ] 
            then
              missingOption $1
            fi  
			buildDir=$2
			shift 2;;
        -wasadminID)
            if [ "$2" == "" ] || [ "${2:0:1}" == "-" ] 
            then
              missingOption $1
            fi  
            wasadminID=$2
            shift 2
            ;;
        -wasadminPW)
            if [ "$2" == "" ] || [ "${2:0:2}" == "-" ] 
            then
              missingOption $1
            fi  
            wasadminPW=$2
            shift 2
            ;;
        -mapWebserver)
            if [ "$2" == "" ] || [ "${2:0:2}" == "-" ] 
            then
              missingOption $1
            fi  
            mapWebserver=$2
            shift 2
            ;;
        -acceptLicense)
            acceptLicense="true"
            shift 1
            ;;
		*)		echo \"$1\" is not an option for this command. 
		        usage
				shift;;
	esac
done

scriptDir=$(cd "$(dirname "$0")"; pwd)
cd ${scriptDir}

export PYTHONPATH=$PYTHONPATH:$PWD
python3 viewer/install.py ${cfgFile} ${buildDir} "${wasadminID}" "${wasadminPW}" "${acceptLicense}" "${mapWebserver}"
