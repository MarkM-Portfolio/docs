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

#sym_monitor.ps1


if( $args.length -ne 1 )
{
	"Usage:"
	"	sym_monitor.ps1 [MaxMemoryLimit]"
	"	MaxMemoryLimt - the maximum value of the working set memory for one soffice process, unit is byte`n"
	"For example:"
	"	.\sym_monitor.ps1 1000000000"
	"\n"
	exit
}

Set-ItemProperty 'HKCU:\SOFTWARE\Microsoft\Windows\Windows Error Reporting' DontShowUI 1

$maxMemValue = $args[0]
$curPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$configFPath = "$curPath\instances.cfg"
$logFile = "$curPath\sym_monitor.log"

#get the configured soffice paths and ports,save to array

$sofficePathPortMap = @{}

Get-Content $configFPath | foreach {
	$idx = $_.LastIndexOf("soffice.exe")
	if($idx -ge 0) 
	{
		$path = $_.Substring(0, $idx + 11).Replace("/","\")
		$port = $_.Substring($idx + 11).TrimStart()
		$sofficePathPortMap[$path] = $port 
	}
}

for($i=0; $i -lt 45; $i++)
{
#	"Starting ......`n"
	#kill soffice whose memory is greater than max memery limit
	get-process soffice -ErrorAction silentlyContinue | where-object {$_.WorkingSet -gt $maxMemValue } | stop-process

	$processObjArray = Get-Process soffice -ErrorAction silentlyContinue
	
	$AllPath = ""
	foreach( $processObj in $processObjArray ) 
	{ 
		$AllPath = $AllPath + $processObj.path
	}

	sleep 3

	foreach( $sofficePath in $sofficePathPortMap.Keys )
	{
		if(!$sofficePath.Equals(""))
		{
			if(!$AllPath.ToLower().Contains($sofficePath.ToLower()))
			{
				"---------------------------------" | Out-File -FilePath $logFile -Append
				"$sofficePath is NOT in memory" | Out-File -FilePath $logFile -Append
				#Comment the below line because starting soffice by template.ps1 can not be connected by conversion
				#& $templateCmd $sofficePath $sofficePathPortMap[$sofficePath]

				$sofficePort = $sofficePathPortMap[$sofficePath]
				#change to call the soffice start command directly instead of calling template.ps1
				& $sofficePath -invisible -conversionmode -headless -hidemenu -nofirststartwizard "-accept=socket,host=0.0.0.0,port=$sofficePort;urp;StarOffice.ServiceManager"
				"Restarted the soffice on" | Out-File -FilePath $logFile -Append
				(Get-Date).DateTime | Out-File -FilePath $logFile -Append
			}else{
				#"$sofficePath is OK."
			}
		}
	}
	
	sleep 3

#	"End .......`n"

}

if(Test-Path $logFile)
{
	$lf = Get-Item $logFile
	if($lf.length -gt 20971520)
	{
		$curTime = get-date
		$newName = $lf.BaseName +"_" + $curTime.Year + "." + $curTime.Month + "." + $curTime.Day + "_" + $curTime.Hour + "." + $curTime.Minute + "." + $CurTime.Second + $lf.Extension
#		$newName
		Rename-Item $logFile -NewName $newName
	}
}
