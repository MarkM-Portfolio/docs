# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# OCO Source Materials                                              
#                                                                   
# Copyright IBM Corp. 2012, 2014                                    
#                                                                   
# The source code for this program is not published or otherwise    
# divested of its trade secrets, irrespective of what has been      
# deposited with the U.S. Copyright Office.                         
#                                                                   
# ***************************************************************** 

import os, sys, subprocess
  
def list_profiles ():
  listProfiles = ['/opt/IBM/WebSphere/AppServer/bin/manageprofiles.sh','-listProfiles']
  pcs = subprocess.Popen(listProfiles, stdout=subprocess.PIPE)
  pcs.wait()
  output = pcs.stdout.read().strip()
  output = output.strip('][')
  if pcs.stdout:
    listed_prof = output.split(',')
  listed_prof = [ i.strip() for i in  listed_prof]
  return len(listed_prof)
  
count = list_profiles()
print count