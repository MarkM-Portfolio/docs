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

setlocal enabledelayedexpansion
set function=""
set msiexecPath=""
set pythonPackage=""
set removePackage=""
set pythonLink=python_is_link.txt

rem Process Command Line Arguments
:ProcArgs
	set Arg0=%1
	shift /1
    if /I %Arg0%. EQU .   goto ChkArgs
	if /I %Arg0%. EQU -h.	call :USAGE & goto END
	if /I %Arg0%. EQU -msiexecPath. (
		if "%1"=="" call :USAGE & goto END
		set msiexecPath=%1
		shift /1
        goto ChkArgs
	)
	if /I %Arg0%. EQU -function. (
		if "%1"=="" call :USAGE & goto END
		set function=%1
		shift /1
        goto ChkArgs
	)
    if /I %Arg0%. EQU -pythonPackage. (
        if "%1"=="" call :USAGE & goto END
        set pythonPackage=%1
        shift /1
        goto ChkArgs
    )
    if /I %Arg0%. EQU -removePackage. (
        if "%1"=="" call :USAGE & goto END
        set removePackage=%1
        shift /1
        goto ChkArgs
    ) else (
        call :USAGE & goto END
    )
        

:ChkArgs
	if not "%1"=="" goto :ProcArgs

set curr_dir=%CD%	 
chdir /D ..
set pythonMsiDir=!CD!
chdir /D !curr_dir!

REM If install and python symlink exists, we are done
if "%function%"=="install" (
    if exist "!pythonMsiDir!\!pythonLink!" (
        goto :END
    )
    echo command issued is %msiexecPath% /q /i "!pythonMsiDir!\%pythonPackage%" /log "!pythonMsiDir!\python.log" ALLUSERS=1 TARGETDIR="!pythonMsiDir!\python"
    start /wait %msiexecPath% /q /i "!pythonMsiDir!\%pythonPackage%" /log "!pythonMsiDir!\python.log" ALLUSERS=1 TARGETDIR="!pythonMsiDir!\python"
) else (
    if exist "!pythonMsiDir!\!pythonLink!" (
        echo erase  "!pythonMsiDir!\!pythonLink!"
        erase  "!pythonMsiDir!\!pythonLink!"
    ) else (
        echo command issued is %msiexecPath% /q /x "!pythonMsiDir!\%pythonPackage%" ALLUSERS=1 TARGETDIR=!pythonMsiDir!\python
        start /wait %msiexecPath% /q /x "!pythonMsiDir!\%pythonPackage%" ALLUSERS=1 TARGETDIR="!pythonMsiDir!\python"
    )
)

exit /b %errorlevel%

:END
	goto :EOF
	
:USAGE
	echo.
	echo =======================================================
	echo.
	echo ### USAGE: python_util.bat {Option}
	echo.
	echo    {Option}
	echo.
	echo      -h                                    : Display this usage screen
	echo      -msiexecPath                          : path to MSIEXEC
	echo      -function (install or uninstall)      : Specifies whether to install or uninstall python
	echo      -pythonPackage (MSI package)          : Specifies python MSI bundle
	echo      -removePackage (true or false)        : remove python if true otherwise remove link
	goto :EOF
