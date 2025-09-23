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

if __name__ == "__main__":
  import sys 
  """
    #  required parameters
    #  path_of_ibmdocs.xml
  """ 
  #************************************************************
  #please keep the commented parts
  #************************************************************
  
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK register_in_news.py"
    sys.exit()
  
  lengtharg = len(sys.argv)
    
  serviceNodeNameNews = None
  if lengtharg >= 4:
    serviceNodeNameNews = sys.argv[3]
  #print "args length is: " + str(lengtharg)  
  #print "serviceNodeNameNews: " + serviceNodeNameNews

  batchMode = 1
  execfile("newsAdmin.py")

  docsHost = sys.argv[0]
  docsContext = sys.argv[1]
  isUnregister = sys.argv[2]

  docs_id = "IBMDocs" 
  docs_url = "http://" + docsHost + "/" + docsContext
  docs_secure_url = "https://" + docsHost + "/" + docsContext
  docs_icon = ""
  docs_display = "Docs"

  if isUnregister == 'True':
    NewsActivityStreamService.registerApplication(docs_id, docs_display, docs_url, docs_secure_url, docs_icon, docs_icon, docs_display, "true")
    # it takes too long if users is large, it could be changed on home page by users, drop it for now    
    #NewsActivityStreamService.updateApplicationRegistrationForEmailDigest(docs_id, "true", "INDIVIDUAL", "false")
    print "Registerd Docs in News successfully"
  else:
    NewsActivityStreamService.removeApplicationRegistration(docs_id)
    print "Unregisterd Docs in News successfully"        
