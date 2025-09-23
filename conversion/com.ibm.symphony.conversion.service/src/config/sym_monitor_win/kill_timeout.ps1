# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

#kill_timeout.ps1

if($args.length -ne 3)
{
	"Usage:"
	"	kill_timeout.ps1 [conversionConfigFilePath] [maxConversionCount] [maxTimeToLive]"
	"	conversionConfigFilePath -  the file path for the conversion server configuration."
	"	maxConversionCount - the max conversion count to be allowed for a soffice instance."
	"			if the conversion count of the soffice is greater than this value, will kill soffice."
	"	maxTimeToLive - the time to live for one conversion by soffice, the unit is second,"
	"			if the conversion time is greater than this value, will kill soffice."
	"For example:"
	"	.\kill_timeout.ps1 .\conversion-config.json 1000 30"
	exit
}

Set-ItemProperty 'HKCU:\SOFTWARE\Microsoft\Windows\Windows Error Reporting' DontShowUI 1

$convCfgPath = $args[0]
$maxConvCount = $args[1]
$maxLiveTime = $args[2]
$curPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$instanceCfgPath = "$curPath\instances.cfg"
$logFile = "$curPath\Kill_timeout.log"

$repoPath = get-content $convCfgPath | foreach { if( $_.contains("repositoryPath") ) { $_ -replace "^.*`"repositoryPath`".*`"(.*)`".*$",'$1' } }
#$repoPath

$symPath = $repoPath + "/output/symphony/"
if(!(test-path $symPath))
{
	"$symPath does not exist, create it." | Out-File -FilePath $logFile -Append
	new-item -path $symPath -type directory | Out-File -FilePath $logFile -Append
}
#$symPath

$sofficePortPathMap = @{}

Get-Content $instanceCfgPath | foreach {
	$idx = $_.LastIndexOf("soffice.exe")
	if($idx -ge 0)
	{
		$tmpPath = $_.Substring(0, $idx + 11).Replace("/","\")
		$tmpPort = $_.Substring($idx + 11).TrimStart()
		$sofficePortPathMap[$tmpPort] = $tmpPath
	}
}

$folderArray = get-childitem $symPath -name 2>>$logFile
#$folderArray

#"---------------------------------"
for($i=0; $i -lt 9; $i++)
{
	foreach ($folder in $folderArray)
	{
		$needKill = "no"
		$sofficePath = $symPath+$folder+"/soffice.json"
	#	$sofficePath
		if(test-path $sofficePath)
		{
			$conversionCount = get-content $sofficePath | foreach { $_ -replace "^{.*`"conversionCount`":([0-9]+).*}$",'$1' }
	#		$conversionCount
	
			$startTime = get-content $sofficePath | foreach { $_ -replace "^{.*`"startTime`":([0-9]+).*}$",'$1' }
	#		$startTime
			
			if([int]$conversionCount -gt [int]$maxConvCount) 
			{
				$needKill = "yes"
	#			"need to kill soffice because of conversion count ($conversionCount) is greater than $maxConvCount"
			}
			elseif ($startTime -gt 0){
				$now = [int64](((get-date).ToUniversalTime().Ticks - 621355968000000000)/10000000)
				$convTime = $now - $startTime
	#			$convTime
				if($convTime -gt $maxLiveTime)
				{
					$needKill = "yes"
	#				"need to kill soffice because conversion time ($convTime) is greater than $maxLiveTime second"
				}
			}
	
			if($needKill -eq "yes")
			{
				$sofficeHost = get-content $sofficePath | foreach { $_ -replace "^{.*`"host`":`"([^`"]*)`".*}$",'$1' }
	#			"host: " + $sofficeHost
	
				$ipAddr = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter IPEnabled=TRUE -ComputerName .| Select-Object -ExpandProperty IPAddress | where-object { $_ -match "\d.\d.\d.\d" }
	#			"ip address: " + $ipAddr
				
				if($sofficeHost -eq "127.0.0.1" -or $sofficeHost -eq "localhost" -or $sofficeHost -eq $ipAddr)
				{
					"Starting to kill soffice ........." | Out-File -FilePath $logFile -Append
					(Get-Date).DateTime | Out-File -FilePath $logFile -Append
	
					$sofficePort = get-content $sofficePath | foreach { $_ -replace "^{.*`"port`":`"([^`"]*)`".*}$",'$1' }
	#				"port: " + $sofficePort
					$instancePath = $sofficePortPathMap[$sofficePort]
					$exePath = $instancePath.Replace("/", "\")
					$binPath = $exePath.Replace(".exe", ".bin")
					get-process -name soffice.bin | where-object { $_.path.ToLower().Equals($binPath.ToLower()) } 2>> $logFile | stop-process
					"Kill process $binPath" | Out-File -FilePath $logFile -Append
					
					sleep 1
					$sourceFile = get-content $sofficePath | foreach { $_ -replace "^{.*`"sourceFile`":`"([^`"]*)`".*}$",'$1' }
					"source file: $sourceFile" | Out-File -FilePath $logFile -Append
					if(Test-Path $sourceFile)
					{
						$sourceFolder = (get-item $sourceFile).PSParentPath.substring("Microsoft.PowerShell.Core\FileSystem::".length)
						Remove-Item $sourceFolder -Recurse 2>> $logFile
						"remove source folder: $sourceFolder" | Out-File -FilePath $logFile -Append
					}
	
					$targetFolder = get-content $sofficePath | foreach { $_ -replace "^{.*`"targetFolder`":`"([^`"]*)`".*}$",'$1' }
					"target folder: $targetFolder" | Out-File -FilePath $logFile -Append
					if(Test-Path $targetFolder)
					{
						Remove-Item $targetFolder -Recurse 2>> $logFile
						"remove target folder: $targetFolder" | Out-File -FilePath $logFile -Append
					}
	
					Remove-Item $sofficePath
					"remove: $sofficePath" | Out-File -FilePath $logFile -Append
					"End ............`n" | Out-File -FilePath $logFile -Append
					"`n" | Out-File -FilePath $logFile -Append
					
				}else{
					"$sofficePath is greater than $maxLiveTime second or conversionCount is greater than $maxConvCount, but it is not running in local machine, ignore!"
					"`n" | Out-File -FilePath $logFile -Append
				}
			}else{
				#"$sofficePath is OK."
			}
		}
	}
	sleep 30
}

if(Test-Path $logFile)
{
	$lf = Get-Item $logFile
	if($lf.length -gt 20971520)
	{
		$curTime = get-date
		$newName = $lf.BaseName +"_" + $curTime.Year + "." + $curTime.Month + "." + $curTime.Day + "_" + $curTime.Hour + "." + $curTime.Minute + "." + $CurTime.Second + $lf.Extension
		$newName
		Rename-Item $logFile -NewName $newName
	}
}