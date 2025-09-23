#! /bin/sh
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

###################################################################
# 1.Generate RPX identify files
 
###################################################################
usage(){
	echo USAGE:$0 [RPXtool home] [PII source folder] [Identify source folder] [pii build]
	exit 1
}
RPX_HOME=$1
if [ ! -f $RPX_HOME/rpx.jar ]
then
	usage
fi

pii_src=$2
pii_tar=$3
pii_build=$4

if [ ! -d $pii_src ]
then
	usage
fi
java -cp $RPX_HOME:$RPX_HOME/rpx.jar RpxPII $RPX_HOME/default.rpxconfig $pii_src $pii_tar

if [ "$pii_build" = "true" ]
then
	cd $pii_src
	cd ..
	piisrcfolder=${pii_src##*/}
	mv $piisrcfolder ${piisrcfolder}.osgi
	mv $pii_tar $piisrcfolder
	mv ${piisrcfolder}.osgi $pii_tar
fi
