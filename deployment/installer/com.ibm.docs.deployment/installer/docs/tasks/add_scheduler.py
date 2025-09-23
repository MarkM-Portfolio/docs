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


import sys



def add_scheduler(args):
  # args are
  # scope, schedName, schedJNDI, schedDSJNDI, schedTablePrefix, schedPoolInterval, wmName

  cellName = AdminControl.getCell()
  # args[0] is 
  # for cluster target scope, /ServerCluster:clusteNmae/, 
  # for server target scope, /Node:myNode/Server:myServer/
  scope = "".join(["/Cell:", cellName, args[0]])

  schedName = args[1] # HouseKeeping
  schedJNDI = args[2] # com/ibm/concord/house_keeping_scheduler
  schedDSJNDI = args[3] # com/ibm/concord/datasource
  schedTablePrefix = args[4] # CONCORDDB.HK
  schedPollInterval = args[5] # 30
  wmName = args[6] # com/ibm/concord/workmanager
  schedProviderID = AdminConfig.getid(scope + 'SchedulerProvider:SchedulerProvider/')

  createSchedulerAtScope(scope, schedName, schedJNDI, schedDSJNDI, schedTablePrefix, schedPollInterval, wmName, schedProviderID)
#endDef



def createSchedulerAtScope( scope, schedName, schedJNDI, schedDSJNDI, schedTablePrefix, schedPollInterval, wmName, schedProviderID, otherAttrsList=[], failonerror=AdminUtilities._BLANK_ ):
        if(failonerror==AdminUtilities._BLANK_):
           failonerror=AdminUtilities._FAIL_ON_ERROR_
        #endIf

        resourceBundle = AdminUtilities.getResourceBundle("com.ibm.ws.scripting.resources.scriptLibraryMessage")

        msgPrefix = "createSchedulerAtScope("+`scope`+", "+`schedName`+", "+`schedJNDI`+", "+`schedDSJNDI`+", "+`schedTablePrefix`+", "+`schedPollInterval`+", "+`wmName`+", "+`schedProviderID`+", "+`otherAttrsList`+", "+`failonerror`+"): "
        try:
                #--------------------------------------------------------------------
                # create a scheduler resource at scope
                #--------------------------------------------------------------------
                print "---------------------------------------------------------------"
                print " AdminResources:                 Create a scheduler at scope"
                print " Scope:"
                print "    scope                        "+scope
                print " Scheduler:"
                print "    name                         "+schedName
                print "    jndi name                    "+schedJNDI
                print "    data source JNDI name        "+schedDSJNDI
                print "    table prefix                 "+schedTablePrefix
                print "    poll interval                "+schedPollInterval
                print "    work management JNDI name    "+wmName
                print "    SchedulerProvider ID         "+schedProviderID
                print " Optional attributes:"
                print "   otherAttributesList:  %s" % (otherAttrsList)
                print "     category "
                print "     datasourceAlias "
                print "     description "
                print "     loginConfigName "
                print "     providerType "
                print "     securityRole "
                print "     useAdminRoles "
                print "     referenceable (Referenceable config id) "
                print " "
                if (otherAttrsList == []):
                   print " Usage: AdminResources.createSchedulerAtScope(\""+scope+"\", \""+schedName+"\", \""+schedJNDI+"\", \""+schedDSJNDI+"\", \""+schedTablePrefix+"\", \""+schedPollInterval+"\", \""+wmName+"\", \""+schedProviderID+"\")"
                else:
                   if (str(otherAttrsList).startswith("[[") >0):
                      print " Usage: AdminResources.createSchedulerAtScope(\""+scope+"\", \""+schedName+"\", \""+schedJNDI+"\", \""+schedDSJNDI+"\", \""+schedTablePrefix+"\", \""+schedPollInterval+"\", \""+wmName+"\", \""+schedProviderID+"\", %s)" % (otherAttrsList)
                   else:
                      if (otherAttrsList.find("\"") > 0):
                          otherAttrsList = otherAttrsList.replace("\"", "\'")
                      print " Usage: AdminResources.createSchedulerAtScope(\""+scope+"\", \""+schedName+"\", \""+schedJNDI+"\", \""+schedDSJNDI+"\", \""+schedTablePrefix+"\", \""+schedPollInterval+"\", \""+wmName+"\", \""+schedProviderID+"\", \""+str(otherAttrsList)+"\")"
                print " Return: The configuration ID of the created Scheduler in the respective scope"
                print "---------------------------------------------------------------"
                print " "
                print " "

                # check the required arguments
                if (scope == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["scope", scope]))

                if (schedName == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["schedName", schedName]))

                if (schedJNDI == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["schedJNDI", schedJNDI]))

                if (schedDSJNDI == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["schedDSJNDI", schedDSJNDI]))

                if (schedTablePrefix == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["schedTablePrefix", schedTablePrefix]))

                if (schedPollInterval == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["schedPollInterval", schedPollInterval]))

                if (wmName == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["wmName", wmName]))

                if (schedProviderID == ""):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6041E", ["schedProviderID", schedProviderID]))

                # check if scope exists
                if (scope.find(".xml") > 0 and AdminConfig.getObjectType(scope) == None):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6040E", ["scope", scope]))

                scopepath = AdminUtilities.getScopeContainmentPath(scope)
                AdminUtilities.debugNotice("scope="+scope)
                AdminUtilities.debugNotice("scope path="+scopepath)

                scopeId = AdminConfig.getid(scopepath)

                if (len(scopeId) == 0):
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6040E", ["scope", scope]))
                #endIf

                # Check if the scheduler configuration name already exists
                schedulerConfigList = AdminConfig.list("SchedulerConfiguration", scopeId)
                schedulerConfigList = AdminUtilities.convertToList(schedulerConfigList)
                for schedulerEntry in schedulerConfigList:
                    if (schedulerEntry.find(schedName) >= 0):
                       # Scheduler exists
                       raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6046E", [schedName]))
                    #endIf
                #endFor

# Get the scheduler provider
                if (AdminConfig.getObjectType(schedProviderID) == None):
                   # SchedulerProvider ID could not be found
                   raise AttributeError(AdminUtilities._formatNLS(resourceBundle, "WASL6040E", ["SchedulerProvider", schedProviderID]))
                else:
                   # Check if the work manager for the scheduler already exists
                   workManager = wmName
                   """
                   workMgrInfo = AdminConfig.list("WorkManagerInfo", scopeId)
                   workMgrInfo = AdminUtilities.convertToList(workMgrInfo)
                   for workManagerInfoEntry in workMgrInfo:
                       workManagerJNDI = AdminConfig.showAttribute(workManagerInfoEntry, "jndiName")
                       if (workManagerJNDI == wmName):
                          workManager = workManagerInfoEntry
                          break
                       else:
                          workManager = wmName
                       #endIf
                   #endFor0
                   """
                #endIf

                # Create the scheduler
                nameAttr = ["name", schedName]
                jndiNameAttr = ["jndiName", schedJNDI]
                datasourceJNDINameAttr  = ["datasourceJNDIName", schedDSJNDI]
                tablePrefixAttr = ["tablePrefix", schedTablePrefix]
                pollIntervalAttr = ["pollInterval", schedPollInterval]
                workManagerInfoAttr = ["workManagerInfoJNDIName", workManager]
                requiredAttrs = [nameAttr, jndiNameAttr, datasourceJNDINameAttr, tablePrefixAttr, pollIntervalAttr, workManagerInfoAttr]

                # convert string "parmName=value, paramName=value ..." to list
                otherAttrsList = AdminUtilities.convertParamStringToList(otherAttrsList)

                finalAttrs = requiredAttrs+otherAttrsList
                scheduler= AdminConfig.create("SchedulerConfiguration", schedProviderID, finalAttrs)

                if (AdminUtilities._AUTOSAVE_ == "true"):
                   AdminConfig.save()

                return scheduler
        except:
                typ, val, tb = sys.exc_info()
                if (typ==SystemExit):  raise SystemExit,`val`
                if (failonerror != AdminUtilities._TRUE_):
                    print "Exception: %s %s " % (sys.exc_type, sys.exc_value)
                    val = "%s %s" % (sys.exc_type, sys.exc_value)
                    raise "ScriptLibraryException: ", `val`
                else:
                    return AdminUtilities.fail(msgPrefix+AdminUtilities.getExceptionText(typ, val, tb), failonerror)
                #endIf
        #endTry
        AdminUtilities.infoNotice(AdminUtilities._OK_+msgPrefix)
#endDef



if __name__ == "__main__":
  if len(sys.argv) < 7:
    print ">>> Errors for arguments number passed to TASK add_scheduler.py"
    sys.exit()
  add_scheduler(sys.argv)
