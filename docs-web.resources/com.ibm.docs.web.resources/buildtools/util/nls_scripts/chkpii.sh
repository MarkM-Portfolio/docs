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
	echo USAGE:$0 rpx_tool_home pii_resource_dir
	echo define SCRIPTROOT, RPX tools should be in the folder, like \$SCRIPTROOT/pseudo/RPX
	echo define LWP_HOME,pii source code in it
	exit 1
}
rpx_home=$1
pii_home=$2
if [ "${3}" = "" ]
then
logfile=checkpii
else
logfile=$3
fi

if [ "${rpx_home}" = "" -o "${pii_home}" = "" ]
then
	usage
fi
cd ${LWP_HOME}
chmod a+x ${rpx_home}/chkpii_lnx
${rpx_home}/chkpii_lnx -C -E -G -I -O ${LWP_HOME}/${logfile} -S "${pii_home}/*.js,${pii_home}/*.html"
cd -
