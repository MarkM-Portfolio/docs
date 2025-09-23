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

:: get version number from DB and write to files concord_schema_version.txt
sqlplus -s / as sysdba @queryProductTag.sql >concord_schema_version.txt

set /a ver=0

:: get the version number from files, assign to var ver
:: keep unchanged if not found
for /f "tokens=*" %%i in (concord_schema_version.txt) do call :processfixupNumber %%i

:: The section below is the db2 way, but not usable for oracle.
:: The routine above will set the ver variable to the fixup number, or 0 if not found
:: So the login below is not used in Oracle

::for /f %%i in (concord_schema_version.txt) do set ver=%%i

::echo %ver%|findstr  "SQL" > nul
::echo errorlevel is %errorlevel%
::if %errorlevel% EQU 0 set ver=0 & echo Check version returns error, set ver to 0

echo Your DB schema version is "%ver%"
set dirty=0
del /q concord_schema_version.txt

:start
set /a ver+=1
if exist fixup%ver%.sql (
	echo applying fixup%ver%.sql
	sqlplus -s / as sysdba @fixup%ver%.sql
	set /a dirty=1
	goto start
)

if %dirty%==0 (
	echo nothing to do!
	goto end
)

echo updating schema version record
	set /a ver-=1
	echo update CONCORDDB.PRODUCT set SCHEMA_VERSION=%ver% where "ID"='lotuslive.symphony'; >updateProductTag.sql
	echo commit; >>updateProductTag.sql
	echo quit; >>updateProductTag.sql

	sqlplus -s / as sysdba @updateProductTag.sql >updateSQLResult.log
	set upResult=0
	for /f %%u in (updateSQLResult.log) do call :processUpdateProduct %%u

	if %upResult%==1 echo "Your Oracle database schema has been updated to version %ver% SUCCESSFULLY"
	if %upResult%==0 echo "Error happens when executing updateProductTag.sql, please check manually"
		 

goto end

:: The logic is to match all non-numbers, it fails means all are numbers, 
:: then it is the fixup number we are looking for
:processfixupNumber
echo %*|findstr /R "[^0-9]" >null 
::echo %errorlevel%
if %errorlevel% EQU 1 set ver=%* 
goto end


:processUpdateProduct
echo %*|findstr "1 row updated" >null 
::echo %errorlevel%
if %errorlevel% EQU 0 set upResult=1
goto end


:end

