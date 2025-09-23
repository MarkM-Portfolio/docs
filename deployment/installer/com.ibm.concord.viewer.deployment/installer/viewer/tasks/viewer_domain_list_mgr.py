# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2016. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 
def showhelp():
  print "usage:"
  print "for example: ------------------------------------"
  print "wsadmin.bat/sh -lang jython -username xx -password xx -f viewer_domain_list_mgr.py -action add -domain value "
  print "wsadmin.bat/sh -lang jython -username xx -password xx -f viewer_domain_list_mgr.py -action delete -domain value "
  sys.exit(2)

def domainhelp():
  print "usage:"
  print "Please check your domain . "
  sys.exit(2)

def doAction(func, args):
  try:
    print '--------------'
    mbean=AdminControl.queryNames("com.ibm.concord.viewer.admin.mbean:type=DomainListMrg,*")
    print mbean
    result = AdminControl.invoke(mbean, func, args)
    print result
    if result.lower() == "true": 
      return 0
    else:
      return -1  
  except Exception, e:
    print e
    return -1

def domain_check(domain):
    import re

    patten = ur'(^((https|http):\/\/)[\w\.\-_*]+[\:]?([\d]{2,5})?(\/)?$)'
    try:
      if re.match(patten,domain):
        return 'true'
      else:
        return 'false'
    except Exception, e:
      return 'false'
    

def domain_func():
    import sys
    import getopt
    
    action = None
    domainStr = None
    result = None
    
    try:
      for para in sys.argv:
        if para in ("-action", "-domain" ):
          key_name = para
          continue                
        if key_name != None:
          if key_name == "-action":
            action = para
          elif key_name == "-domain":
            domainStr = para
            flag = domain_check(domainStr)
            print flag
            if flag == 'false':
              domainhelp()
          else:
            showhelp()  
        key_name = None         
      
      if action == "add":
        if domainStr == None:
          showhelp()      
        else:
          result = doAction("addDomain", (domainStr))
      elif action == "delete":
        if domainStr == None:
          showhelp()      
        else:        
          result = doAction("removeDomain", (domainStr))
      else:
        showhelp() 
    except Exception, e:
      showhelp() 
      print e
    
    if result == 0:
      print ">>> Customer Domain List updates are completed successfully."
      sys.exit(0)
    else:
      print ">>> Failed to execute Customer Domain List update. Check SystemOut.log for detailed information."
      sys.exit(-1)

if __name__ == "__main__":

    domain_func()