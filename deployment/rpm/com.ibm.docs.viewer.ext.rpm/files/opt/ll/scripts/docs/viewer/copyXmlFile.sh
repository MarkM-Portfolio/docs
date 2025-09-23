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
    
####ibmdocs.xml import
ObjectTypes=${LocalFS}/customization/objecttypes/
echo $ObjectTypes
if [ ! -d  $ObjectTypes ];then
        mkdir -p $ObjectTypes
else
        echo $ObjectTypes  " exists"
fi

echo "Copying ibmdocs.xml file to customization area"
/bin/cp /opt/ll/apps/docs/viewer/ibmdocs.xml $ObjectTypes
