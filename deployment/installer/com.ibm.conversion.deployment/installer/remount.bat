@echo off
@REM ***************************************************************** 
@REM                                                                   
@REM IBM Confidential                                                  
@REM                                                                   
@REM IBM Docs Source Materials                                         
@REM                                                                   
@REM (c) Copyright IBM Corporation 2012. All Rights Reserved.          
@REM                                                                   
@REM U.S. Government Users Restricted Rights: Use, duplication or      
@REM disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
@REM                                                                   
@REM ***************************************************************** 


set cfgFile="./cfg.properties"
set buildDir="../"
set wasadminID=""
set wasadminPW=""
set acceptLicense="false"
set silentlyInstall="false"

rem Process Command Line Arguments
:ProcArgs
	set Arg0=%1
	shift /1
	if /I %Arg0%. EQU -h.		call :USAGE & goto END
	if /I %Arg0%. EQU -configFile. (
		if "%1"=="" call :USAGE & goto END
		set cfgFile=%1
		shift /1
	)
	if /I %Arg0%. EQU -build. (
		if "%1"=="" call :USAGE & goto END
		set buildDir=%1
		shift /1
	)
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
    if /I %Arg0%. EQU -acceptLicense. (
        set acceptLicense="true"
    )      
    if /I %Arg0%. EQU -silentlyInstall. (
        set silentlyInstall="true"
    )
    

:ChkArgs
	if not "%1"=="" goto :ProcArgs

set PYTHONPATH=%PYTHONPATH%;%CD%
python conversion/install_newmount.py %cfgFile% %buildDir% %wasadminID% %wasadminPW% %acceptLicense% %silentlyInstall%

:END
	goto :EOF

:USAGE
	echo.
	echo =======================================================
	echo.
	echo ### USAGE: install.bat {Option}
	echo.
	echo    {Option}
	echo.
	echo        -h                    : Display this usage screen
	echo        -configFile {file}    : Specifies the path to configuration file.
	echo                                cfg.properties in current directory used if not specified.
	echo        -build {directory}    : Specifies where to locate the product binaries.
	echo                                Upper level folder used if not specified.
    echo        -wasadminID {name}    : Specifies the user name of WAS administrator,
    echo                                prompt to input during installation if not specified.
    echo        -wasadminPW {password}: Specifies the password of WAS administrator,
    echo                                prompt to input during installation if not specified.
    echo        -acceptLicense        : Specifies if you accept license automatically.
    echo                                prompt to decide during installation if not specified.
    echo        -silentlyInstall      : Specifies that the installation is running in a silent mode. 
    echo                                All issues will display during the installation, but will not block it.
	goto :EOF
