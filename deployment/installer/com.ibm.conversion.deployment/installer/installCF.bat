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

cd C:\installer
set PYTHONPATH=%PYTHONPATH%;%CD%
python conversion/installCF.py 
if errorlevel 1 (
   echo FAILURE: Non-zero error level returned when installing Conversion Server. Check install logs for details.
   exit /b %errorlevel%
)
cd C:\
