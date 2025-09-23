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
upgrade.sh [OPTION]

Options
    -installRoot <directory>   Specifies the path to install root of File Viewer application.
                               Required for the upgrade to start.
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
installRoot=""
buildDir="../"
wasadminID=""
wasadminPW=""
acceptLicense="false"
mapWebserver="false"

while [ "$1" != "" ]
do
	case $1 in
		-installRoot)
		    if [ "$2" == "" ] || [ "${2:0:2}" == "-" ] 
		    then
		      missingOption $1
		    fi	
		    installRoot=$2
		    cfgFile=$2/cfg.properties	
		    shift 2;;
		-build)
            if [ "$2" == "" ] || [ "${2:0:2}" == "-" ] 
            then
              missingOption $1
            fi  
			buildDir=$2
			shift 2;;
        -wasadminID)
            if [ "$2" == "" ] || [ "${2:0:2}" == "-" ] 
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

if [ "$installRoot" == "" ]
then 
   echo Upgrade cannot start until you add the parameter -installRoot {directory}, where directory is the path where the HCL Docs root is currently installed.
   echo For example, enter ./upgrade.sh -installRoot /opt/IBM/IBMDocs
   usage
fi

export PYTHONPATH=$PYTHONPATH:$PWD
python3 viewer/upgrade.py ${cfgFile} ${buildDir} "${wasadminID}" "${wasadminPW}" "${acceptLicense}" "${mapWebserver}"
