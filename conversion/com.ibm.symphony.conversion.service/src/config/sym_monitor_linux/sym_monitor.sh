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

# $1 : filepath to config file
#      which contains the soffice instance path and port info
# $2 : threshold value for virtual memory size of soffice process
# $3 : filepath to log file
# $4 : filepath to template of starting soffice
# EXAMPLE:
#      sym_monitor.sh instances.cfg 1000000 monitor.log template.sh 2>error.log

configFpath=$1 
MaxSize=$2 
logFpath=$3
startSofficeTemplateFpath=$4  

d=`date`
echo "*****************************" $d "*****************************" >> $logFpath

result1=`cat $configFpath | cut -d" " -f1`
allPathArray=($result1)
result2=`cat $configFpath | cut -d" " -f2`
allPortArray=($result2)

for((it=0; it < 90; it++))
do
#echo $it >> $logFpath
#scan the dead soffic
psResult=`ps -eo cmd | grep soffice| grep -v "grep"| tr -s ' ' |cut -d" " -f 1`
#echo $psResult >> $logFpath
    for(( i=0; i<${#allPathArray[@]} ;i++))
    do
    iE=`echo $psResult | grep ${allPathArray[$i]}`
    if [  "${#iE}" = "0" ];then
      $startSofficeTemplateFpath ${allPathArray[$i]} ${allPortArray[$i]}
      echo "the soffice has been restart : " ${allPathArray[$i]} ${allPortArray[$i]}  >> $logFpath
    fi
    done
sleep 3
done
sleep 1

#scan the unnormal soffice
# all the ps is test in the ubuntu,  the other version maybe have some diffrent format
psRCMD=`ps -eo ppid,pid,vsize,stat,cmd --sort pid| grep soffice| grep -v "grep"| tr -s ' ' |cut -d" " -f 6-`
#echo $psRCMD >> $logFpath
arrayCMD=($psRCMD)

# get path and port of the living soffice.bin
for((i=0; i<${#arrayCMD[@]}; i=i+6))
do
arrayPath[$i/6]=${arrayCMD[$i]}
tmp=${arrayCMD[$i+5]}
tmp1=`echo ${tmp##*port=}`
arrayPort[$i/6]=`echo ${tmp1%%;*}`
done

psResult=`ps -eo ppid,pid,vsize,stat,cmd --sort pid| grep soffice| grep -v "grep"| tr -s ' ' |cut -d" " -f 3-5`
array=($psResult)
length=${#array[@]}

for((i=0; i<$length/2;i++))
do
pidArray[$i]=${array[${i}*3]}
memArray[$i]=${array[${i}*3+1]}
statArray[$i]=${array[${i}*3+2]}
#echo ${pidArray[$i]}  ${memArray[$i]}  ${statArray[$i]} >> $logFpath
# log the zombie process
sta=`echo ${statArray[$i]} | cut -c1`
if [[ "$sta" = "Z" ]] || [[ "$sta" = "z" ]] ; then
   echo "the soffice : " ${arrayPath[$i]} ${arrayPort[$i]}  "is a zambie" >> $logFpath
   kill -9 ${pidArray[$i]}
fi

#log the memory of process exceed the MaxSize
if [[  ${memArray[$i]} -ge $MaxSize  ]] ; then
  kill -9 ${pidArray[$i]}
  $startSofficeTemplateFpath ${arrayPath[$i]} ${arrayPort[$i]}
  echo "the soffice : " ${arrayPath[$i]} ${arrayPort[$i]} " the mem is " ${memArray[$i]} "has been killed and restart" >> $logFpath
fi
done
