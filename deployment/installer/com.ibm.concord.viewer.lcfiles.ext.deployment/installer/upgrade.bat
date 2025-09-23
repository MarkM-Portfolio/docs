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
      if /I %Arg0%. EQU -acceptLicense. (
          set acceptLicense="true"
      ) else (
          echo "%Arg0%" is not an option for this command.
          call :USAGE & goto END
      )

:ChkArgs
  if "%1"=="" (
       if %installRoot%=="" (
           echo Upgrade cannot start until you add the parameter -installRoot {directory}, where directory is the path where the HCL File Viewer extension root is currently installed.
           echo There may not be an install root for extension.  In this case, specify the parent folder of the cfg.properties
           echo For example, enter upgrade.bat -installRoot "C:\Program Files\IBM\FileViewer\extension"
           call :USAGE & goto END
       )
  ) else (
    goto :ProcArgs
  )

set PYTHONPATH=%PYTHONPATH%;%CD%
python icext/upgrade.py %cfgFile% %buildDir% %wasadminID% %wasadminPW% %acceptLicense%

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
    echo        -installRoot {directory}    : (Required) Specifies the location of the current installation of the HCL File Viewer extension component.
    echo                                    : If related component does not have an installation root, specifies the parent folder for cfg.properties.
    echo        -build {directory}          : Specifies the location of the product binaries.
    echo                                      The folder that contains current folder is used if none specified.
    echo        -wasadminID {name}          : Specifies the user name of the WebSphere Application Server administrator.
    echo                                      Prompted during installation if none specified.
    echo        -wasadminPW {password}      : Specifies the password of the WebSphere Application Server administrator.
    echo                                      Prompted during installation if none specified.
    echo        -acceptLicense              : Specifies if you accept license automatically.
    echo                                      Prompted during installation if not specified.
    goto :EOF
