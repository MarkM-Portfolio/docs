Rundeck Patch Automation
------------------------
Name: ViewerNext rundeck package


--------
Instructions to prepare the linux/windows ViewerNext Rundesk manually:

1> If we need patching for Viewer application:
   To prepare the com.ibm.concord.viewer.ear.ear package and its viewer-version.txt 
2> If we need patching for Conversion application:
   To prepare the com.ibm.symphony.conversion.service.rest.was.ear.ear package and its conversion-version.txt 
   if Conversion native needs patching:
       To prepare native.zip
3> Copy all files in deployment/fixpack/rundesk/viewernext/linux to a temp folder for patching Linux ViewerNext servers
   Copy executeChange.py and rollbackChange.py in deployment/fixpack/rundesk/viewernext/ to a temp folder for patching Windows ViewerNext servers
4> Modify below variables in applyVNPatch accordingly & save the change   
   NATIVE_UPDATE = "false"
   VIEWER_EAR_UPDATE = "true"
   CONV_EAR_UPDATE = "true"
5> Copy above ear packages, version files and native.zip if necessary to this temp folder
6> zip all files together to create a ViewerNext Rundesk Patch package           

7> rollbackChange command can only be used for the first patch after production online
8> After patching a few times, the ViewerNext rollback operation can be executed by running the last successful patch 
   which is available on Rundesk Patching server. (Docs developer must provide the correct rollback patching package)
 
The instructions below describe in detail how to 

	- How to Upload your "Automated Patch ZIP" file to Rundeck
	- How to execute the Rundeck "Automated Patching" job to install your patch


How to Upload your "Automated Patch ZIP" file to Rundeck
----------------------------------------------
Upload your "Automated Patch ZIP" file to Rundeck using the patch uploader site at https://rundeck1.swg.usma.ibm.com/patchuploader/

Enter an appropriate name in the "Change Name" section. This is required in the when you execute the Rundeck "Automated Patching" job.


How to execute the Rundeck "Automated Patching" job to install your patch
-------------------------------------------------------------------------
- Open the Rundeck UI at https://rundeck1.swg.usma.ibm.com:4443/
- In the Rundeck UI, select the "JobDevelopment" project
- Navigate to the /PROMOTED/AutoPatching folder and click on the "Automated Patching V2" job
- Enter the setting for the patch execution, for example:
	
	cloudID: BHT5A
	verboseF5Log: False
	ignoreF5HealthCheckFail: False
	changeFile: RTC12345-patch_viewernext_20191226_1200.zip
	sourcePath: http://rundeck1.swg.usma.ibm.com/changerepository
	runMode: execute
	ignoreSanityFail: False
	userName: <username for DPUI login>
	dpuiHostName: cloud.swg.usma.ibm.com
	nodeTypes: ViewerNext 

Note: If the target node(s) have been redeployed since previously running the "Automated Patching V2" job then it you must run the
	/IN_DEVELOPMENT/CHEF/"Clear Chef Node" Job against each node to be patched PRIOR to running the "Automated Patching V2" job.

For more details refer to: https://w3-connections.ibm.com/activities/service/html/mainpage#activitypage,1e61f5ef-14b9-471a-a27d-cf8cf50e8ffd





