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

:: get version number from DB and write to tiles
db2 -x connect to CONCORD
db2 -x select "SCHEMA_VERSION" from "CONCORDDB"."PRODUCT" where "ID"='lotuslive.symphony' >concord_schema_version.txt
db2 connect reset
set /a ver=0
:: get the version number from files, assign to var ver
for /f %%i in (concord_schema_version.txt) do set ver=%%i

echo %ver%|findstr  "SQL" > nul
::echo errorlevel is %errorlevel%
if %errorlevel% EQU 0 set ver=0 & echo Check version returns error, set ver to 0

echo Your DB schema version is "%ver%"
::set /a ver=
::set /a ver=%1
set dirty=0
del /q concord_schema_version.txt

:start
set /a ver+=1
if exist fixup%ver%.sql (
	echo applying fixup%ver%.sql
	db2 -td@ -f fixup%ver%.sql
	set /a dirty=1
	goto start
)

if %dirty%==0 (
	echo nothing to do!
	goto end
)

echo updating schema version record
	set /a ver-=1
	db2 connect to CONCORD
	db2 update "CONCORDDB"."PRODUCT" set "SCHEMA_VERSION"='%ver%' where "ID"='lotuslive.symphony'
	db2 connect reset
echo your schema has been updated to version %ver%


:end

