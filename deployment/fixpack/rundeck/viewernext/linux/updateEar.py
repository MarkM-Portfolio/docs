# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2018. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 
import sys

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------  
if __name__ == '__main__' :
   """
       #  required parameters
       #  serverName, earPath
   """
   if len(sys.argv) < 2:
      print ">>> Errors for arguments number passed to update ear package."
      sys.exit()
    
   appName = sys.argv[0] #IBMConversion, IBMViewer
   earPath = sys.argv[1] #./com.ibm.symphony.conversion.service.rest.was.ear.ear   
   AdminApp.update(appName,'app',['-operation', 'update', '-contents', earPath])
   AdminConfig.save()
