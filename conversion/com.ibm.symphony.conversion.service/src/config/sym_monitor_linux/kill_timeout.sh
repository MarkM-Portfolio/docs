#!/bin/bash
# ***************************************************************** 
#                                                                   
# HCL Confidential                                                  
#                                                                   
# OCO Source Materials                                              
#                                                                   
# Copyright HCL Technologies Limited 2022                           
#                                                                   
# The source code for this program is not published or otherwise    
# divested of its trade secrets, irrespective of what has been      
# deposited with the U.S. Copyright Office.                         
#                                                                   
# ***************************************************************** 


# This script is used to kill Symphony soffice process if the conversion
# time is more than a predefined value(e.g. 30 second),
# or the conversion count of the soffice instance is greater than a predefined value(e.g. 1000).
# after kill soffice, will remove the conversion source folder and target folder

if [ $# -ne 3 ];then
	echo
	echo "Usage:"
	echo "	kill_timeout.sh [conversionConfigFilePath] [maxConversionCount] [maxTimeToLive]"
	echo "	conversionConfigFilePath -  the file path for the conversion server configuration."
	echo "	maxConversionCount - the max conversion count to be allowed for a soffice instance,"
	echo "			if the conversion count of the soffice is greater than this value, will kill soffice."
	echo "	maxTimeToLive - the time to live for one conversion by soffice, the unit is second,"
	echo "			if the conversion time is greater than this value, will kill soffice."
	echo
	echo "For example:"
	echo "	./kill_timeout.sh /root/config/conversion-config.json 1000 30"
	echo
	exit 1
fi

convCfgPath=$1
maxConvCount=$2
maxLiveTime=$3

repoPath=`cat $convCfgPath | tr '[:blank:]' '\0' | sed -n 's/.*"repositoryPath":\(.*\)/\1/p' | cut -d'"' -f2`
#echo repository path is: $repoPath

symPath=$repoPath/output/symphony
#echo symphony path is: $symPath

folderArray=`ls -l $symPath | grep ^d | grep -v grep | tr -s ' ' | cut -d" " -f9`
for folder in ${folderArray[@]}; do
	needKill="no"
	sofficePath=$symPath/$folder/soffice.json
#	echo soffice path is:$sofficePath
	if [ -e $sofficePath ];then
		conversionCount=`sed 's/^{.*"conversionCount":\([0-9]*\).*}$/\1/' $sofficePath`
#		echo count is: $conversionCount
		startTime=`sed 's/^{.*"startTime":\([0-9]*\).*}$/\1/' $sofficePath`
#		echo start time is: $startTime
		if [[ -n $conversionCount && $conversionCount -gt $maxConvCount ]];then
			needKill="yes"
#			echo "need to kill soffice because of conversion count is greaten than  1000"	
		elif [[ -n $startTime && $startTime -gt 0 ]];then
			let convTime=`date +%s`-$startTime
#			echo conversion time is: $convTime seconds
			if [ $convTime -gt $maxLiveTime ];then
				needKill="yes"
#				echo "need to kill soffice because conversion is greater than 30 seconds"
			fi
		fi
#	 	echo needkill value: $needKill	
		if [ $needKill = "yes" ];then	
			sofficeHost=`sed 's/^{.*"host":"\([^"]*\)".*}$/\1/' $sofficePath`
#			echo host is: $sofficeHost
			ipAddr=`/sbin/ifconfig | grep "inet addr" | tr -s " " | cut -d" " -f3 | sed -e 's/addr://g' -e 's/127\.0\.0\.1//'`
#			echo ip address is: $ipAddr
			if [[ $sofficeHost = "127.0.0.1" || $sofficeHost = "localhost" || $sofficeHost = $ipAddr ]];then
				sofficePort=`sed 's/^{.*"port":"\([^"]*\)".*}$/\1/' $sofficePath`
#				echo port is: $sofficePort
				pid=`ps -eo pid,cmd | grep soffice | grep -v grep | sed -n "s/^[^0-9]*\([0-9]*\).*port=$sofficePort.*$/\1/p"`
#				echo pid is: $pid
				if [ $pid ];then
#					echo start---------------------			
					sourceFile=`sed 's/^{.*"sourceFile":"\([^"]*\)".*}$/\1/' $sofficePath`
					sourceFolder=`dirname "$sourceFile"`
#					echo source folder is: $sourceFolder
					targetFolder=`sed 's/^{.*"targetFolder":"\([^"]*\)".*}$/\1/' $sofficePath`
#					echo target folder is: $targetFolder
					if [ -e $sourceFolder ];then
						rm -rf $sourceFolder
#						echo "remove source folder files"
					fi
					if [ -e $targetFolder ];then
						rm -rf $targetFolder
#						echo "remove target folder files"
					fi
#					echo remove soffice $sofficePath
					rm -rf $sofficePath
#					echo "kill the pid $pid"
					kill -9 $pid
#					echo end-----------------------
				fi
			fi
		fi
	fi

done


