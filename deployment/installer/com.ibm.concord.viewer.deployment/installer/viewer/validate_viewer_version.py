# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

# -*- encoding: utf8 -*-

import os, sys
from commands import command
from util.common import call_wsadmin
import logging as log
from viewer.config import CONFIG as CFG


class CheckViewerVersion(command.Command):

  def __init__(self):
    pass

  def readCfg(self, cfg=None):
	return True

  def do(self):
    log.info("Validating Viewer version...")
    suc,version=CFG.get_viewer_build_version()
    if not suc:
		log.error("Failed to get build version for version.txt.")
		return False
    log.info("Successfully get build version("+version+") from installation package.")
    #Then get the installed version from WAS CELL variable to compare.
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/get_websphere_variable.py"])
    succ, ws_out = call_wsadmin(args)

    if not succ:
		return False
    else:
		from util import wsadminlib
		lines=wsadminlib._splitlines(ws_out)
		for line in lines:
			if(line.find("VIEWER_VERSION")>-1 and line.find("CONVERSION_VERSION")>-1 and line.find("DOCS_VERSION")>-1):
				component_version_array=line.split("#")
				viewer_version=component_version_array[0].split(":")[1]
				conversion_version=component_version_array[1].split(":")[1]
				docs_version=component_version_array[2].split(":")[1]
				#print viewer_version+" "+conversion_version+" "+docs_version

				viewer_compare_result=self.compareVersion(viewer_version,version)
				conversion_compare_result=self.compareVersion(conversion_version,version)
				docs_compare_result=self.compareVersion(docs_version,version)

				ret=True
				if viewer_version!='-1':
					if viewer_compare_result < 0:
						log.error("An earlier version of the Viewer application was detected. Uninstall the old version and then start the installation again.")
						ret=False
					elif viewer_compare_result ==0:
						log.error("A copy of the Viewer application is already installed on this system as part of HCL File Viewer or HCL Docs. Uninstall the product that contains the Viewer application, and then install the Viewer application.")
						ret=False
					else:
						log.error("The Viewer application will not be installed because a more recent version of the application was detected.")
						ret=False
				else:
					if conversion_version!='-1':
						if conversion_compare_result < 0:
							log.error("An earlier version of the Conversion server was detected that is not compatible with this version of the Viewer application. Uninstall the Conversion server and then install the Viewer application.")
							ret=False
						elif conversion_compare_result==0:
							ret=True
						else:
							log.error("The Viewer application will not be installed because the version of the Conversion server that was detected is more recent and not compatible.")
							ret=False
		return ret

  def undo(self):
    #do nothing.
    return True

  def compareVersion(self,arg1,arg2):
	import string
	arr1=arg1.split(".")
	arr2=arg2.split(".")
	if len(arr1)<len(arr2):
		i=0
		for arg in arr1:
			if int(arg)>int(arr2[i]):
				return 1
			elif int(arg)<int(arr2[i]):
				return -1
			i=i+1
		return -1
	elif len(arr1)==len(arr2):
		i=0
		for arg in arr1:
			if int(arg)>int(arr2[i]):
				return 1
			elif int(arg)<int(arr2[i]):
				return -1
			i=i+1
		return 0
	else:
		i=0
		for arg in arr2:
			if int(arg)>int(arr1[i]):
				return -1
			elif int(arg)<int(arr1[i]):
				return 1
			i=i+1
		return 1
