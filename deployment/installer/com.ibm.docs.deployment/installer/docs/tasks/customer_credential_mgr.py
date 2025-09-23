# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2015. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 
def showhelp():
  print "usage:"
  print "for example: ------------------------------------"
  print "wsadmin.bat/sh -lang jython -username xx -password xx -f customer_credential_mgr.py -action add -customer customer_id -key key -value value"
  print "wsadmin.bat/sh -lang jython -username xx -password xx -f customer_credential_mgr.py -action update -customer customer_id -key key -value value"
  print "wsadmin.bat/sh -lang jython -username xx -password xx -f customer_credential_mgr.py -action delete -customer customer_id -key key"
  print "wsadmin.bat/sh -lang jython -username xx -password xx -f customer_credential_mgr.py -action delete -customer customer_id"  
  sys.exit(2)

                	
def doAction(func, args):
  try:
    mbean=AdminControl.queryNames("com.ibm.concord.platform.mbean:type=CustomerCredentialMgr,*")
    result = AdminControl.invoke(mbean, func, args)
    if result.lower() == "true": 
      return 0
    else:
      return -1  
  except Exception, e:
    print e
    return -1
       

if __name__ == "__main__":
  import sys
  import getopt
       
  action = None
  customer_id = None
  key = None
  value = None  
  result = None
  
  try:
    for para in sys.argv:
      if para in ("-action", "-customer", "-key", "-value"):
        key_name = para
        continue				
      if key_name != None:		       
        if key_name == "-action":
          action = para
        elif key_name == "-customer":
          customer_id = para
        elif key_name == "-key":
          key = para
        elif key_name == "-value":    	
          value = para
        else:
          showhelp()  
      key_name = None		 
        
    if action == "add":
      if customer_id == None or key == None or value == None:
        showhelp()  	
      else:  
        result = doAction("addCredential", (customer_id, key, value))     
    elif action == "update":  
      if customer_id == None or key == None or value == None:
        showhelp()  	
      else:    	
        result = doAction("updateCredential", (customer_id, key, value))
    elif action == "delete":
      if customer_id == None:
        showhelp()  	
      elif key != None:    	
        result = doAction("removeCredential", (customer_id, key))  
      else:		
        result = doAction("deleteCredential", (customer_id))  	  
    else:
      showhelp() 
  except:
    showhelp() 

  if result == 0:
    print ">>> CustomerCredential updates are completed successfully."
    sys.exit(0)
  else:
    print ">>> Failed to execute CustomerCredential update. Check SystemOut.log for detailed information."
    sys.exit(-1)