#!/bin/sh
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


psResult=`ps -eo ppid,pid,vsize,stat,cmd --sort pid | grep soffice | grep -v "grep" | tr -s ' ' | cut -d" " -f 3-5`

array=($psResult)
length=${#array[@]}

for ((i=0; i<$length/3;i++))
do
pid=${array[${i}*3]}
echo killing soffice process $pid
kill -9 $pid
done
