@echo off
@REM ***************************************************************** 
@REM                                                                   
@REM Licensed Materials - Property of IBM.                                                  
@REM                                                                   
@REM IBM Docs Source Materials                                              
@REM                                                                   
@REM (c) Copyright IBM Corporation 2012. All Rights Reserved.                                          
@REM                                                                   
@REM U.S. Government Users Restricted Rights: Use, duplication or 
@REM disclosure restricted by GSA ADP Schedule Contract with 
@REM IBM Corp.  
@REM                                                                   
@REM ***************************************************************** 


set cfgFile="./cfg.properties"
set buildDir="../"
set wasadminID=""
set wasadminPW=""
set acceptLicense="false"

rem Process Command Line Arguments
:ProcArgs
      set Arg0=%1
      shift /1
      if /I %Arg0%. EQU .   goto ChkArgs
      if /I %Arg0%. EQU -h. call :USAGE & goto END
      set Arg1=%1.
      if /I %Arg0%. EQU -configFile. (
          if "%1"==""     call :MissingValue & goto END
          if "%Arg1:~0,1%"=="-"   call :MissingValue & goto END
          set cfgFile=%1
          shift /1
          goto ChkArgs
      )
      if /I %Arg0%. EQU -build. (
          if "%1"==""     call :MissingValue & goto END
          if "%Arg1:~0,1%"=="-"   call :MissingValue & goto END
          set buildDir=%1
          shift /1
          goto ChkArgs
      )
      if /I %Arg0%. EQU -wasadminID. (
          if "%1"==""     call :MissingValue & goto END
          if "%Arg1:~0,1%"=="-"   call :MissingValue & goto END
          set wasadminID=%1
          shift /1
          goto ChkArgs
      )
      if /I %Arg0%. EQU -wasadminPW. (
          if "%1"==""     call :MissingValue & goto END
          if "%Arg1:~0,1%"=="-"   call :MissingValue & goto END
          set wasadminPW=%1
          shift /1
          goto ChkArgs
      )
      if /I %Arg0%. EQU -acceptLicense. (
          set acceptLicense="true"
      ) else (
          echo "%Arg0%" is not an option for this command.
          call :USAGE & goto END
      )

:ChkArgs
	if not "%1"=="" goto :ProcArgs

set PYTHONPATH=%PYTHONPATH%;%CD%
python icext/install.py %cfgFile% %buildDir% %wasadminID% %wasadminPW% %acceptLicense%

:END
	goto :EOF

:MissingValue
    echo The value for "%Arg0%" does not exist. Check the value for errors and try again.

:USAGE
    echo.
    echo =======================================================
    echo.
    echo ### USAGE: install.bat {Option}
    echo.
    echo    {Option}
    echo.
    echo        -h                    : Display this usage screen
    echo        -configFile {file}    : Specifies the configuration file.
    echo                                cfg.properties in current directory is used if none specified.
    echo        -build {directory}    : Specifies the location of the product binaries.
    echo                                The folder that contains current folder is used if none specified.
    echo        -wasadminID {name}    : Specifies the user name of the WebSphere Application Server administrator.
    echo                                Prompted during installation if none specified.
    echo        -wasadminPW {password}: Specifies the password of the WebSphere Application Server administrator.
    echo                                Prompted during installation if none specified.
    echo        -acceptLicense        : Specifies if you accept license automatically.
    echo                                Prompted during installation if not specified.
	goto :EOF
