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
    -configFile <file> Specifies the configuration files
                       cfg.properties in current directory used if not specified.
    -build <directory> Specifies where to locate the product binaries
	                   Upper level folder used if not specified
    -wasadminID <name> Specifies the name of WAS administrator
                       prompt to input during installation if not specified.
    -wasadminPW <pwd>  Specifies the password of WAS administrator
                       prompt to input during installation if not specified.
    -acceptLicense     Specifies if you accept license automatically.
                       prompt to decide during installation if not specified.                       
EOM
	exit 1
}

cfgFile="./cfg.properties"
buildDir="../"
wasadminID=""
wasadminPW=""
acceptLicense="false"

while [ "$1" != "" ]
do
    if [ "$2" == "" ] && [ "$1" != "-acceptLicense" ]
    then
        usage
    fi
	case $1 in
		-configFile)	cfgFile=$2
				shift 2;;
		-build)		buildDir=$2
				shift 2;;
        -wasadminID)
            wasadminID=$2
            shift 2
            ;;
        -wasadminPW)
            wasadminPW=$2
            shift 2
            ;;
        -acceptLicense)
            acceptLicense="true"
            shift 1
            ;;            
		*)		usage
				shift;;
	esac
done

export PYTHONPATH=$PYTHONPATH:$PWD
python icext/install.py ${cfgFile} ${buildDir} "${wasadminID}" "${wasadminPW}" "${acceptLicense}"
