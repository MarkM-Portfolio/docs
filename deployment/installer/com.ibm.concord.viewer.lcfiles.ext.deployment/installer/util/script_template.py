# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


GUNINSTALL_W32=\
'''@echo off

echo Prepare python27 environment...
cd /d %~dp0
start /wait vcredist_x86.exe /q /norestart

set wasadminID=""
set wasadminPW=""
set path="./Python";%path%

rem Process Command Line Arguments
:ProcArgs
	set Arg0=%1
	shift /1
	if /I %Arg0%. EQU -h.		call :USAGE & goto END
    if /I %Arg0%. EQU -wasadminID. (
        if "%1"=="" call :USAGE & goto END
        set wasadminID=%1
        shift /1
    )
    if /I %Arg0%. EQU -wasadminPW. (
        if "%1"=="" call :USAGE & goto END
        set wasadminPW=%1
        shift /1
    )

:ChkArgs
	if not "%1"=="" goto :ProcArgs

set PYTHONPATH=%PYTHONPATH%;%CD%
python icext/uninstall.py "%cfgFile%" "%buildDir%" %wasadminID% %wasadminPW%

:END
	goto :EOF

:USAGE
    echo.
    echo =======================================================
    echo.
    echo ### USAGE: uninstall.bat {Option}
    echo.
    echo    {Option}
    echo.
    echo        -h                    : Display this usage screen
    echo        -wasadminID {name}    : Specifies the user name of the WebSphere Application Server administrator.
    echo                                Prompted during installation if none specified.
    echo        -wasadminPW {password}: Specifies the password of the WebSphere Application Server administrator.
    echo                                Prompted during installation if none specified.
	goto :EOF
'''

GUNINSTALL_LNX=\
'''#!/bin/sh

usage()
{
        cat << EOM
uninstall.sh [OPTION]

Options
        -wasadminID <name> Specifies the user name of the WebSphere Application Server administrator.
                           Prompted during installation if none specified.
        -wasadminPW <pwd>  Specifies the password of the WebSphere Application Server administrator.
                           Prompted during installation if none specified.
EOM
        exit 1
}

wasadminID=""
wasadminPW=""

while [ "$1" != "" ]
do
        if [ "$2" == "" ]
        then
            usage
        fi
        case $1 in
                -wasadminID)    wasadminID=$2
                                shift 2;;
                -wasadminPW)    wasadminPW=$2
                                shift 2;;
                *)              usage
                                shift;;
        esac
done

export PYTHONPATH=$PYTHONPATH:$PWD
python3 icext/uninstall.py "${cfgFile}" "${buildDir}" "${wasadminID}" "${wasadminPW}"
'''


