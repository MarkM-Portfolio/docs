@echo off
schtasks.exe /end /TN "sym_monitor"
schtasks.exe /delete /F /TN "sym_monitor"
schtasks.exe /end /TN "kill_timeout"
schtasks.exe /delete /F /TN "kill_timeout"

REM DON"T CHANGE THIS TEMPlATE WITHOUT UNDERSTANDING
REM This is a BAT script that should be executed in Powershell environment after replacing directory path
   
