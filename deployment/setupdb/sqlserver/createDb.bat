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

echo Please enter login name for HCL Connections Docs database.
set /p id="Login name:"
sqlcmd -i createdb.sql -v id="%id%"
