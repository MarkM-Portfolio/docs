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

echo Please input the Oracle database password when promoted for entering
sqlplus -s / as sysdba @createDb.sql 

