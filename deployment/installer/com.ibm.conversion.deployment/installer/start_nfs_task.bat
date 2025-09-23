@echo off
schtasks.exe /create /TN "nfs_monitor" /RU $username /RP $password /NP /RL HIGHEST /SC MINUTE /MO 5 /TR "powershell $list_file_path"
powershell set-executionpolicy remotesigned -Force
schtasks.exe /change /enable /TN "nfs_monitor"
schtasks.exe /run /I /TN "nfs_monitor"

REM DON"T CHANGE THIS TEMPlATE WITHOUT UNDERSTANDING
REM This is a BAT script that should be executed in Powershell environment after replacing directory path
   
