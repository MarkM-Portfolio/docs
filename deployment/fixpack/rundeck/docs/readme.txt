Rundeck Patch Automation
------------------------
Name: docs rundeck package


Overview:
--------
The scripts in this directory can be used to build a "Automated Patch ZIP" file for use with Rundeck to automatically deploy
patches to EAR files, JAR files and other (non-EAR/JAR) files in a previously deployed SC Docs environment.
The "Automated Patch ZIP" file contains these scripts, together with any patched EAR files, JAR files, and other files to be installed
on the target node(s) to be patched. 

The scripts perform the following actions on each patch target node:

- Permission change for patch script
- patch zip md5 validation
- Drain off requests of current docs servers so that it can be patched safely without any requests come in anymore.
- Apply patch that will probably update concord-config.json and update ear package.
- Set docs as active status in zookeeper so that docsrp could route the /docs request to this server.


Rollback:
	A rollback script (rollbackChange) is provided to restore the original the EAR files, JAR files and any other
	files that were updated(such as concord_config.json) and restart the affected application server(s).


Applicable Nodes Types:
	Docs Application Server


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
	changeFile: RTC12345-patch_docs_20160525_1200.zip
	sourcePath: http://rundeck1.swg.usma.ibm.com/changerepository
	runMode: execute
	ignoreSanityFail: False
	userName: <username for DPUI login>
	dpuiHostName: cloud.swg.usma.ibm.com
	nodeTypes: Docs App 

Note: If the target node(s) have been redeployed since previously running the "Automated Patching V2" job then it you must run the
	/IN_DEVELOPMENT/CHEF/"Clear Chef Node" Job against each node to be patched PRIOR to running the "Automated Patching V2" job.

For more details refer to: https://w3-connections.ibm.com/activities/service/html/mainpage#activitypage,1e61f5ef-14b9-471a-a27d-cf8cf50e8ffd





