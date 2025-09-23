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
db2 connect to CONCORD 
#db2 connect to CONCORD >/dev/null 2>&1
output=`db2 -x "select \"SCHEMA_VERSION\" from \"CONCORDDB\".\"PRODUCT\" where \"ID\"='lotuslive.symphony'"` 
db2 connect reset

# Parse schema number, or set to 0 if not found
trim() { echo $1; }
VERSION="$(trim $output )"
echo "Schema version number is $VERSION"
if ! [[ "$VERSION" =~ ^[0-9]+$ ]]
then
	echo "Get NON-NUMBER FOR SCHEMEMA version, SET IT TO ZERO "
	VERSION=0
fi
echo "update sql with version $VERSION"

DIRTY=0

while [ "" = "" ]
do
    ((VERSION++))
    if [ -f "fixup$VERSION.sql" ]
    then
        echo "applying fixup$VERSION.sql"
        dos2unix -n fixup$VERSION.sql fixup_tmp.sql
        mv -f fixup_tmp.sql fixup$VERSION.sql
        db2 -td@ -f fixup$VERSION.sql
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
    db2 connect to CONCORD
    db2 "update CONCORDDB.PRODUCT set SCHEMA_VERSION='$VERSION' where ID='lotuslive.symphony'"
    db2 connect reset 
echo "your schema has been updated to version $VERSION"
