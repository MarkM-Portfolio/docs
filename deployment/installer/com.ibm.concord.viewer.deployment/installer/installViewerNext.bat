@echo off
@setlocal
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

@if exist D: goto EXTEND
set SHARED_DRV=D
FOR %%a IN (F G I H) DO (MOUNTVOL %%a: /L >NUL 2>&1 || SET SHARED_DRV=%%a)

wmic diskdrive get index | find /v "Index" > disk.lst
SET DRIVEID=9
for %%g in (5,4,3,2,1) do (
 findstr %%g disk.lst > nul && set DRIVEID=%%g && goto FOUNDDISK
)
:FOUNDDISK
echo %DRIVEID%
del /Q disk.lst

echo create partition

@echo rescan > dps.txt
@echo sel disk %DRIVEID% >> dps.txt
@echo online disk noerr >> dps.txt
@echo attributes disk clear readonly >> dps.txt
@echo clean >> dps.txt
@echo create partition primary >> dps.txt
@echo format quick >> dps.txt
@echo assign letter=%SHARED_DRV% >> dps.txt
@goto EXEC
:EXTEND
echo extend D:
@echo sel volume 3 > dps.txt
@echo extend >> dps.txt
set SHARED_DRV=D
:EXEC
@echo exit >> dps.txt
diskpart /s dps.txt 1>C:\LotusLive\Log\ViewerNextInstall.log 2>&1

if errorlevel 1 (
  echo diskpart got error %errorlevel%, retry again
  diskpart /s dps.txt 1>>C:\LotusLive\Log\ViewerNextInstall.log 2>&1
)

if errorlevel 1 (
  echo FAILURE: Non-zero error level %errorlevel% returned from diskpart when installing ViewerNext Server. Check install logs for details.
  wevtutil epl System      C:\LotusLive\Log\Windows.System.evtx   /ow
  wevtutil epl Application C:\LotusLive\Log\Windows.Application.evtx  /ow
  wevtutil epl Security    C:\LotusLive\Log\Windows.Security.evtx  /ow
  python C:\ViewerNext\Viewer\installer\viewer\updateActivationStatus.py "FAILURE: diskpart returns %errorlevel%"
  cd C:\
  exit /b %errorlevel%
)

md %~dp0\ViewerNext\Temp
set TEMP=%~dp0\ViewerNext\Temp
set TMP=%~dp0\ViewerNext\Temp


cd /d %~dp0/ViewerNext/Viewer/installer

set VIEWERNEXT_INSTALL=true
set PYTHONPATH=%PYTHONPATH%;%CD%

@echo Begin ViewerNext components installation...
python viewer/installViewerNext.py 1>>C:\LotusLive\Log\ViewerNextInstall.log 2>&1

if errorlevel 1 (
   echo FAILURE: Non-zero error level returned when installing ViewerNext Server. Check install logs for details.
   exit /b %errorlevel%
)
cd C:\
@endlocal