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

usage()
{
	echo USAGE:$0 [source code folder]
	exit 1
}
if [ ! -n "$1" ]
then
	usage
fi
if [ ! -d $1 ]
then
	usage
fi
SCRIPTHOME=`dirname $BASH_SOURCE`

sourcedir=$1
for anlsfolder in `find $sourcedir -type d -name "*.nls"`; do
    for alangfolder in `find $anlsfolder -type d -name "lang"`; do
        cd $alangfolder

        for afile in `ls | grep ".js"`; do
                aslang=${afile%%.*}
		echo ............$alangfolder/$afile...........
                perl -p -i -e "s/\'en\'/\'$aslang\'/g" $afile
        done
    done
    for alang in `ls $anlsfolder`; do
	echo Handling $anlsfolder ......
	cp -rf $anlsfolder/$alang/* $sourcedir
    done
done
