#/bin/sh
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

is_flipping="$1"
database_instance_username="$2"

export BUILD_HOME="/opt/ll/apps/ac/migrations"
export OS=Linux

if [[ $is_flipping = "" ]]	
then
    is_flipping="false"
fi

if [ $is_flipping = "true" ]	
then
    echo $database_instance_username
    db2Username=$database_instance_username
else
    source /opt/ll/lib/registry/registryLib.sh
    getSetting AC database_instance_username
    db2Username=$REGISTRY_DATA
fi

source /usr/local/ibmsaas_ac.env
source /home/${db2Username}/.bashrc

/opt/ll/scripts/ac/dbMigrate.sh docs /opt/ll/apps/docs/migrations
