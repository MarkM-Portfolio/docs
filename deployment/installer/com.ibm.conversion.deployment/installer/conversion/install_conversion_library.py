# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


import os, logging, sys, subprocess, time

from common import command

class InstallConversionLibrary(command.Command):
    
  def __init__(self):
    pass
      
  def precheck(self):
    return True

  def postcheck(self):
    return True

  def readCfg(self, cfg=None):
    return True

  def do(self):
    # Conversoin Library(EXE file) is packaged into OSGI BUNDLE JAR installation process, so just output instalation message
    logging.info("Conversion Library is installed successfully")

    return True

  def undo(self):
    logging.info("Stopping the OOXMLConverter processes")
    if os.name == "nt":
      #logging.warning("not implemented yet")
      subprocess.call(["taskkill.exe", "/f", "/im", "OOXMLConvertor.exe"])
      time.sleep(10)
    else:
      logging.warning("NO OOXMLConverter supported in Linux")
      #subprocess.call(["dos2unix", KILL_SYM_SH]) # 4170, to fix potential window format shell file
      #subprocess.call([KILL_SYM_SH])
    logging.info("All the OOXMLConvertor processes stopped")

    return True

    