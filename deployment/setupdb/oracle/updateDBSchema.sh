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


# Get schema from DB
sqlplus -s / as sysdba @queryProductTag.sql >/tmp/concord_schema_version.txt

# Parse schema number, or use default value 0 if not found
ver=0
while read line
do 
	if [[ $line =~ [0-9]+ ]] ; then
		ver=$line
	fi
done </tmp/concord_schema_version.txt

#echo "Schema version number is $VERSION"
if ! [[ "$ver" =~ ^[0-9]+$ ]]
then
	echo "Get NON-NUMBER FOR SCHEMEMA version, SET IT TO ZERO "
	ver=0
fi
# MUST TRIM the trailing \r
VERSION=$( echo "$ver" | tr -d $'\r' )

echo "update sql with version  [$VERSION]"

DIRTY=0

while [ 1 = 1 ]
do
    echo $VERSION
    ((VERSION++))
    if [ -f "fixup$VERSION.sql" ]
    then
        echo "applying fixup$VERSION.sql"
        dos2unix -n fixup$VERSION.sql fixup_tmp.sql
        mv -f fixup_tmp.sql fixup$VERSION.sql
        sqlplus -s / as sysdba @fixup$VERSION.sql
        DIRTY=1
    else
        break
    fi
done

if [ $DIRTY = 0 ]
then
    echo nothing to do!
    exit 0
fi

echo "updating schema version record"
    ((VERSION--))
    echo "update CONCORDDB.PRODUCT set SCHEMA_VERSION=$VERSION where ID='lotuslive.symphony';" >/tmp/updateProductTag.sql
	echo "commit;" >>/tmp/updateProductTag.sql
	echo "quit;" >>/tmp/updateProductTag.sql
	sqlplus -s / as sysdba @/tmp/updateProductTag.sql >/tmp/updateSQLResult.log

	#Check SQL update execution results
	result=0
	while read res
	do 
		if [[ $res =~ "1 row updated" ]] ; then
			result=1
		fi
	done </tmp/updateSQLResult.log

	if [ $result = 0  ] ; then
		echo "Error happens when executing /tmp/updateProductTag.sql, please check manually"
	else
		echo "Your Oracle database schema has been updated to version $VERSION SUCCESSFULLY"
	fi
	
