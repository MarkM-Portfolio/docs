@REM ***************************************************************** 
@REM                                                                   
@REM Licensed Materials - Property of IBM                              
@REM                                                                   
@REM 5724-E76, 5724-L21, 5724-i67, 5724-L64, 5655-M44                  
@REM                                                                   
@REM Copyright IBM Corp. 2012  All Rights Reserved.                    
@REM                                                                   
@REM US Government Users Restricted Rights - Use, duplication or       
@REM disclosure restricted by GSA ADP Schedule Contract with           
@REM IBM Corp.                                                         
@REM                                                                   
@REM ***************************************************************** 

@echo off

REM ****************************************
REM Check the number of batch file arguments
REM ****************************************

if x%3 == x (

	echo Usage: runWebSphereAs.bat sWASInstallPath sWASAdmin sWASPassword
	exit /B 1000
)

REM ***************
REM Setup variables
REM ***************

echo %DATE% %TIME% : I : Setting up variable, websphereInstallBase = %1

set websphereInstallBase=%1

echo %DATE% %TIME% : I : Setting up variable, servicename = %2

set servicename=%2

echo %DATE% %TIME% : I : Setting up variable, username = %3

set username=%3

echo %DATE% %TIME% : I : Setting up variable, password = (not displayed)

set password=%4

REM ********************************************
REM Check that the WebSphere install base exists
REM ********************************************

echo %DATE% %TIME% : I : Checking that directory %websphereInstallBase% exists ...

if not exist %websphereInstallBase% (

	echo %DATE% %TIME% : E : %errorLevel% - Directory %websphereInstallBase% doesn't exist

	exit /B 1001

) else (

	echo %DATE% %TIME% : I : Directory %websphereInstallBase% exists
)

REM **********************************************************
REM Check that the user account to run WebSphere
REM
REM If the account doesn't exist, create it
REM If the account exists, then set the password
REM **********************************************************

echo %DATE% %TIME% : I : Checking user account %username% ...

net user > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to get list of user accounts

	exit /B 1002
)

findstr %username% runWebSphereAs.tmp > nul 2>&1

if %errorLevel% == 0 (

	set action=setPassword

) else (

	set action=createAccount
)

REM resets the errorLevel to 0 / DO NOT REMOVE
ver > nul

if %action%==setPassword (

	echo %DATE% %TIME% : I : Setting password for user account %username% ...

	net user "%username%" "%password%" > runWebSphereAs.tmp 2>&1

	if not %errorLevel% == 0 (

		echo %DATE% %TIME% : E : %errorLevel% - Unable set password for user account %username%

		exit /B 1003

	) else (

		echo %DATE% %TIME% : I : Password set for user account %username%
	)
)

if %action%==createAccount (

	echo %DATE% %TIME% : I : Creating user account %username% ...

	net user "%username%" "%password%" /add > runWebSphereAs.tmp 2>&1

	if not %errorlevel% == 0 (

		echo %DATE% %TIME% : E : %errorLevel% - Unable to create user account %username%

		exit /B 1004

	) else (

		echo %DATE% %TIME% : I : User account %username% created
	)
)

REM *************************************************************************************
REM Build and apply the security template to allow the user account to logon as a service
REM *************************************************************************************

REM echo %DATE% %TIME% : I : Creating and applying security template for user account %username% to logon as a service ...

echo [Unicode] > Local_Security_Template.inf
echo Unicode=yes >> Local_Security_Template.inf
echo [Registry Values] >> Local_Security_Template.inf
echo [Privilege Rights] >> Local_Security_Template.inf
echo SeServiceLogonRight = "%username%" >> Local_Security_Template.inf
echo [Version] >> Local_Security_Template.inf
echo signature="$CHICAGO$" >> Local_Security_Template.inf
echo Revision=1 >> Local_Security_Template.inf
echo [Profile Description] >> Local_Security_Template.inf
echo Description=Local Security Template >> Local_Security_Template.inf

REM secedit /configure /db secedit.sdb /cfg Local_Security_Template.inf > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to apply security template to allow account %username% to logon as a service

	exit /B 1005

) else (

	echo %DATE% %TIME% : I : Security template applied to allow user account %username% to logon as a service
)

REM ***************************************************************************
REM Create symlink to the WebSphere directory to work around path length issues
REM ***************************************************************************

set symlinkName=WAS

if exist %symlinkName% (

	rmdir /q %symlinkName% > runWebSphereAs.tmp 2>&1

	if not %errorLevel% == 0 (

		echo %DATE% %TIME% : E : %errorLevel% - Unable to delete symbolic link %symlinkName%

		exit /B 1006
	)
)

mklink /D %symlinkName% %websphereInstallBase% > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to create symbolic link %symlinkName% to directory %websphereInstallBase%

	exit /B 1007

) else (

	echo %DATE% %TIME% : I : Symlink %symlinkName% created to work around path length issues
)


REM *****************************************
REM Take ownership of the WebSphere directory
REM *****************************************

echo %DATE% %TIME% : I : Taking ownership of directory %symlinkName% ...

takeown /f %symlinkName% /r /d y > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to take ownership of directory %symlinkName%

	exit /B 1008

) else (

	echo %DATE% %TIME% : I : Ownership taken for directory %symlinkName%
)

REM ********************************************
REM Reset permissions on the WebSphere directory
REM ********************************************

echo %DATE% %TIME% : I : Resetting permissions on directory %symlinkName% ...

icacls %symlinkName% /reset /t > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to reset permissions on directory %symlinkName%

	exit /B 1009

) else (

	echo %DATE% %TIME% : I : Permissons reset on directory %symlinkName%
)

REM ********************************************
REM Grant permissions on the WebSphere directory
REM ********************************************

echo %DATE% %TIME% : I : Granting permissions on directory %directory% ...
icacls %symlinkName% /grant:r "%computername%\%username%":(OI)(CI)F > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to grant permissions on directory %symlinkName%

	exit /B 1010

) else (

	echo %DATE% %TIME% : I : Permissions granted on directory %symlinkName%
)

REM ****************************************
REM Set ownership of the WebSphere directory
REM ****************************************

REM ******************************
REM Skipping code to set ownership
REM ******************************
goto skip_ownership

echo %DATE% %TIME% : I : Setting ownership of directory %symlinkName% ...

icacls %symlinkName% /t /setowner "%computername%\%username%" > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to set ownership of directory %symlinkName%

	exit /B 1011

) else (

	echo %DATE% %TIME% : I : Ownership set for directory %symlinkName%
)

:skip_ownership

REM ***************************************************************
REM Change the WebSphere Windows Services to run as our new account
REM ***************************************************************

set serviceName=IBMWAS85Service - %servicename%

echo %DATE% %TIME% : I : Changing service "%serviceName% to run as %username% ...

sc config "%serviceName%" obj= "%computername%\%username%" password= "%password%" > runWebSphereAs.tmp 2>&1

if not %errorLevel% == 0 (

	echo %DATE% %TIME% : E : %errorLevel% - Unable to change account for service %serviceName%

	exit /B 1015

) else (

	echo %DATE% %TIME% : I : Changed account for service %serviceName% to %username%
)

REM ***************************************
REM Cleanup temporary files and the symlink
REM ***************************************

if exist Local_Security_Template.inf (

	del /q Local_Security_Template.inf

)

if exist runWebSphereAs.tmp (

	del /q runWebSphereAs.tmp

)

if exist %symlinkName% (

	rmdir /q %symlinkName% > runWebSphereAs.tmp 2>&1
)

