@echo off
schtasks.exe /end /TN "nfs_monitor"
schtasks.exe /delete /F /TN "nfs_monitor"

REM DON"T CHANGE THIS TEMPlATE WITHOUT UNDERSTANDING
REM This is a BAT script that should be executed in Powershell environment after replacing directory path
   
