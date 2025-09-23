# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-
from commands import command
import logging as log
from util.common import call_wsadmin
from viewer.config import CONFIG as CFG

IMAGE_PNG_MIME_TYPE = 'image/png'
IMAGE_PNG_EXTENSIONS = 'png PNG'
VIRTUAL_HOST_NAME = 'default_host'

class AddImagePng(command.Command):

  def do(self):
    log.info("Start to create Image Png for Viewer Virtual Hosts")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([IMAGE_PNG_MIME_TYPE])
    args.extend([IMAGE_PNG_EXTENSIONS])
    args.extend([VIRTUAL_HOST_NAME])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Create Image Png for Viewer Virtual Hosts completed")
    return True

  def undo(self):
    log.info("Start to delete Image Png for Viewer Virtual Hosts ")
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([IMAGE_PNG_MIME_TYPE])
    args.extend([VIRTUAL_HOST_NAME])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Delete Image Png for Viewer Virtual Hosts completed")
    return True
