@echo off
::cd %temp%
::working dir
cd %1
echo %1 >> conv_nfs_check.log

::nfs server ip/hostname for docs
echo %2 >> conv_nfs_check.log
::nfs server exported share point for docs
echo %3 >> conv_nfs_check.log

::nfs server ip/hostname for viewer
echo %4 >> conv_nfs_check.log
::nfs server exported share point for viewer
echo %5 >> conv_nfs_check.log

::mount dirver for docs
echo %6 >> conv_nfs_check.log
::mount dirver for viewer
echo %7 >> conv_nfs_check.log
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
dir %6%
if %ERRORLEVEL% NEQ 0 (
	echo "Not Exist Client mount point for Docs" >> conv_nfs_check.log
  	goto QUIT
) else (
	echo "" >> conv_nfs_check.log
	echo "Exist Client mount point for Docs" >> conv_nfs_check.log
)

dir %6%\nfs_test
if %ERRORLEVEL% NEQ 0 (
  echo "Given directory doesn't exist in client mount point for Docs." >> conv_nfs_check.log
) else (
  rd /S /Q %6%\nfs_test
)

dir %6%

::mkdir %6%\nfs_test
::if %ERRORLEVEL% NEQ 0 (
::  echo "No WRight to create directory in client mount point for Docs." >> conv_nfs_check.log
::  goto QUIT
::) else (
::  echo "WRight to create directory in client mount point for Docs" >> conv_nfs_check.log  
::)

dir %6%
dir %6%\nfs_test.txt
if %ERRORLEVEL% NEQ 0 (
  echo "Given file name doesn't exist in client mount point for Docs." >> conv_nfs_check.log
) else (
  del /F /Q %6%\nfs_test.txt
)

dir %6%
echo "NFS client checking for docs from another mount driver..." > %6%\nfs_test.txt
echo "" >> conv_nfs_check.log

dir %6% >> conv_nfs_check.log
dir %6%\nfs_test.txt >> conv_nfs_check.log

dir %6%\nfs_test.txt
if %ERRORLEVEL% NEQ 0 (
  echo "No WRight to create file in mounted Docs Driver." >> conv_nfs_check.log
  echo "No WRight to edit file in mounted Docs Driver" >> conv_nfs_check.log
  goto QUIT
) else (
  echo "WRight to create file in mounted Docs Driver" >> conv_nfs_check.log
  echo "WRight to edit file in mounted Docs Driver" >> conv_nfs_check.log
)

dir Z:
if %ERRORLEVEL% NEQ 0 (
	echo "" >> conv_nfs_check.log
	echo "Driver Z: has not been used already..." >> conv_nfs_check.log
) else (
	echo "" >> conv_nfs_check.log
	echo "Driver Z: has been used already..." >> conv_nfs_check.log
	goto QUIT
)

umount -f Z:
net use /delete Z:
mount -o mtype=soft retry=10 timeout=18 casesensitive=yes anon %2:%3 Z:
if %ERRORLEVEL% NEQ 0 (
	echo "" >> conv_nfs_check.log
	echo "Failed to mount Docs Driver" >> conv_nfs_check.log
	goto QUIT
) else (
	echo "" >> conv_nfs_check.log
	echo "Successfully to mount Docs Driver" >> conv_nfs_check.log
)

::cd %1
dir %6% >> conv_nfs_check.log
dir Z: >> conv_nfs_check.log
dir Z:\nfs_test.txt >> conv_nfs_check.log
dir Z:\nfs_test.txt
if %ERRORLEVEL% NEQ 0 (
  echo "The client point for Docs is not a mounted point." >> conv_nfs_check.log
  goto QUIT
) else (
  echo "The client point for Docs is a mounted point." >> conv_nfs_check.log
)

del /F /Q %6%\nfs_test.txt
if %ERRORLEVEL% NEQ 0 (
  echo "No DRight to delete file in mounted Docs Driver" >> conv_nfs_check.log
  goto QUIT
) else (
  echo "DRight to delete file in mounted Docs Driver." >> conv_nfs_check.log
)

rd /S /Q %6%\nfs_test
if %ERRORLEVEL% NEQ 0 (
  echo "No DRight to delete directory in mounted Docs Driver" >> conv_nfs_check.log
  goto QUIT
) else (
  echo "DRight to delete directory in mounted Docs Driver." >> conv_nfs_check.log
)
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
dir %7%
if %ERRORLEVEL% NEQ 0 (
  echo "Not Exist Client mount point for Viewer" >> conv_nfs_check.log
  goto QUIT
) else (
  echo "Exist Client mount point for Viewer" >> conv_nfs_check.log
)

dir %7%\nfs_test
if %ERRORLEVEL% NEQ 0 (
  echo "Given directory doesn't exist in client mount point for Viewer." >> conv_nfs_check.log
) else (
  rd /S /Q %7%\nfs_test
)

::mkdir %7%\nfs_test
::if %ERRORLEVEL% NEQ 0 (
::  echo "No WRight to create directory in mounted Viewer Driver." >> conv_nfs_check.log
::  goto QUIT
::) else (  
::  echo "WRight to create directory in mounted Viewer Driver" >> conv_nfs_check.log
::)

dir %7%
dir %7%\nfs_test.txt
if %ERRORLEVEL% NEQ 0 (
  echo "Given file name doesn't exist in client mount point for Viewer." >> conv_nfs_check.log
) else (
  del /F /Q %7%\nfs_test.txt
)

dir %7%
echo "NFS client checking for viewer from another mount driver..." > %7%\nfs_test.txt

echo "" >> conv_nfs_check.log
dir %7% >> conv_nfs_check.log
dir %7%\nfs_test.txt >> conv_nfs_check.log
dir %7%\nfs_test.txt
if %ERRORLEVEL% NEQ 0 (
  echo "No WRight to create file in mounted Viewer Driver." >> conv_nfs_check.log
  echo "No WRight to edit file in mounted Viewer Driver" >> conv_nfs_check.log  
  goto QUIT
) else (
  echo "WRight to create file in mounted Viewer Driver" >> conv_nfs_check.log
  echo "WRight to edit file in mounted Viewer Driver" >> conv_nfs_check.log
)

umount -f Z:
mount -o mtype=soft retry=10 timeout=18 casesensitive=yes anon %4:%5 Z:
if %ERRORLEVEL% NEQ 0 (
	echo "" >> conv_nfs_check.log
 	echo "Failed to mount Viewer Driver" >> conv_nfs_check.log
  	goto QUIT
) else (
	echo "" >> conv_nfs_check.log
	echo "Successfully to mount Viewer Driver" >> conv_nfs_check.log
)

dir %7% >> conv_nfs_check.log
dir Z: >> conv_nfs_check.log
dir Z:\nfs_test.txt >> conv_nfs_check.log
dir Z:\nfs_test.txt
if %ERRORLEVEL% NEQ 0 (
  echo "The client point for Viewer is not a mounted point." >> conv_nfs_check.log
  goto QUIT
) else (
  echo "The client point for Viewer is a mounted point." >> conv_nfs_check.log
)

del /F /Q %7%\nfs_test.txt
dir %7%
if exist %7%\nfs_test.txt (
  echo "No DRight to delete file in mounted Viewer Driver" >> conv_nfs_check.log
) else (
  echo "DRight to delete file in mounted Viewer Driver." >> conv_nfs_check.log
)

rd /S /Q %7%\nfs_test
dir %7%
if exist %7%\nfs_test (
  echo "No DRight to delete directory in mounted Viewer Driver" >> conv_nfs_check.log
) else (
  echo "DRight to delete directory in mounted Viewer Driver." >> conv_nfs_check.log
)

:QUIT
umount -f Z:

::echo %1
::echo ~dp0
cd %1

mkdir logs
copy conv_nfs_check.log .\logs\
del /F /Q conv_nfs_check.log