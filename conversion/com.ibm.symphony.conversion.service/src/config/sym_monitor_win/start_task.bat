@echo off
schtasks.exe /create /F /TN "sym_monitor" /RL HIGHEST /SC MINUTE /MO 5 /TR "powershell -executionpolicy RemoteSigned $IBMConversions/sym_monitor/sym_monitor.ps1 1000000000"
schtasks.exe /create /F /TN "kill_timeout" /RL HIGHEST /SC MINUTE /MO 5 /TR "powershell -executionpolicy RemoteSigned $IBMConversions/sym_monitor/kill_timeout.ps1 $IBMConversions/config/conversion-config.json 1000 120"
REM powershell set-executionpolicy remotesigned -Force
schtasks.exe /change /enable /TN "sym_monitor"
schtasks.exe /run /I /TN "sym_monitor"
schtasks.exe /change /enable /TN "kill_timeout"
schtasks.exe /run /I /TN "kill_timeout"

REM DON"T CHANGE THIS TEMPlATE WITHOUT UNDERSTANDING
REM This is a BAT script that should be executed in Powershell environment after replacing directory path
   
