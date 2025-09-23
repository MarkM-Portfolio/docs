@echo off
@REM ***************************************************************** 
@REM                                                                   
@REM IBM Confidential                                                  
@REM                                                                   
@REM IBM Docs Source Materials                                         
@REM                                                                   
@REM (c) Copyright IBM Corporation 2015. All Rights Reserved.          
@REM                                                                   
@REM U.S. Government Users Restricted Rights: Use, duplication or      
@REM disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
@REM                                                                   
@REM ***************************************************************** 

:: get version number from DB and write to tiles
set ver=
sqlcmd -d CONCORD -Q "select SCHEMA_VERSION from CONCORDDB.PRODUCT where ID='lotuslive.symphony'" > concord_schema_version.txt
for /f "skip=2" %%G IN (concord_schema_version.txt) DO if not defined ver set "ver=%%G"
echo ver=%ver%
if not defined ver set ver=0
set dirty=0
del /q concord_schema_version.txt

:start
set /a ver+=1
if exist fixup%ver%.sql (
	echo applying fixup%ver%.sql
	sqlcmd -i fixup%ver%.sql
	set /a dirty=1
	goto start
)

if %dirty%==0 (
	echo nothing to do!
	goto end
)

echo updating schema version record
	set /a ver-=1
  sqlcmd -d CONCORD -Q "update CONCORDDB.PRODUCT set SCHEMA_VERSION=%ver% where ID='lotuslive.symphony'"
echo your schema has been updated to version %ver%

:end

