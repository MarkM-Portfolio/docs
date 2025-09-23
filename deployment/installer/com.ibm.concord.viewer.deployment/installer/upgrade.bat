@echo off
@REM *****************************************************************
@REM
@REM HCL Confidential
@REM
@REM OCO Source Materials
@REM
@REM Copyright HCL Technologies Limited 2020
@REM
@REM The source code for this program is not published or otherwise
@REM divested of its trade secrets, irrespective of what has been
@REM deposited with the U.S. Copyright Office.
@REM
@REM *****************************************************************
set cfgFile="./cfg.properties"
set installRoot=""
set buildDir="../"
set wasRunAs=""
set wasadminID=""
set wasadminPW=""
set acceptLicense="false"
set mapWebserver="false"

rem Process Command Line Arguments
:ProcArgs
      set Arg0=%1
      shift /1
      if /I %Arg0%. EQU .   goto ChkArgs
      if /I %Arg0%. EQU -h. call :USAGE & goto END
      set Arg1=%1.
      if /I %Arg0%. EQU -installRoot. (
          if "%1"==""     call :MissingValue & goto END
          if "%Arg1:~0,1%"=="-"   call :MissingValue & goto END
    	  set installRoot=%1
    	  set cfgFile=%1/cfg.properties
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
      if /I %Arg0%. EQU -mapWebserver. (
          if "%1"==""     call :MissingValue & goto END
          if "%Arg1:~0,1%"=="-"   call :MissingValue & goto END
          set mapWebserver=%1
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
    if "%1"=="" (
       if %installRoot%=="" (
           echo Upgrade cannot start until you add the parameter -installRoot {directory}, where directory is the path where the HCL Docs root is currently installed.
           echo For example, enter upgrade.bat -installRoot "C:\Program Files\IBM\FileViewer"
           call :USAGE & goto END
       )
    ) else (
       goto :ProcArgs
    )

set PYTHONPATH=%PYTHONPATH%;%CD%
python viewer/upgrade.py %cfgFile% %buildDir% %wasadminID% %wasadminPW% %acceptLicense% %mapWebserver%

:END
	goto :EOF

:MissingValue
    echo The value for "%Arg0%" does not exist. Check the value for errors and try again.

:USAGE
    echo.
    echo =======================================================
    echo.
    echo ### USAGE: upgrade.bat {Option}
    echo.
    echo  {Option}
    echo.
    echo  -h                     : Display this usage screen
    echo  -installRoot{directory}: Specifies the path where the File Viewer application
    echo                           root is currently installed.Required for the upgrade
    echo                           to start.
    echo  -build {directory}     : Specifies the location of the product binaries.
    echo                           The folder that contains current folder is used
    echo                           if none specified.
    echo  -wasadminID {name}     : Specifies the user name of the WebSphere Application
    echo                           Server administrator.Prompted during installation
    echo                           if none specified.
    echo  -wasadminPW {password} : Specifies the password of the WebSphere Application
    echo                           Server administrator.Prompted during installation
    echo                           if none specified.
    echo  -acceptLicense         : Specifies if you accept license automatically.
    echo                           Prompted during installation if not specified.
    echo  -mapWebserver {true/false}: Set it to be true only if there's one IBM HTTP Server
    echo                           in front of Viewer Cluster.
	goto :EOF
