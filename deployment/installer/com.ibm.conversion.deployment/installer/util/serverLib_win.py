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

import os, time, sys, subprocess, socket


def createProfile(adminUsername, adminPassword, serverName='server1', profileName='AppSrv01', 
        installDir=r'/Program Files/IBM/WebSphere/AppServer'):
   hostname = socket.gethostname().split('.')[0]
   adminUsername = adminUsername.encode('ascii','ignore')

   print 'Creating profile for server %s' % (serverName)
   try:
      cmd = [ '"%s/bin/manageprofiles.bat"' % installDir, '-create',
              '-templatePath', '"%s/profileTemplates/default"' % installDir,
              '-profileName', profileName,
              '-nodeName', 'ocs_app_node_%s' % hostname,
              '-serverName', serverName,
              '-enableAdminSecurity', 'true',
              '-adminUserName', adminUsername, '-adminPassword', adminPassword ]

      #print cmd
      p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         print line.strip('\n')
      retval = p.wait()
      if retval:
         raise Exception('RC %s while creating WebSphere profile' % (retval))
   except:
      print 'Error:  Failed to create profile'
      raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))


#---------------------------------------------------------------------------------------------
# Start a server by name via WAS BAT script
#---------------------------------------------------------------------------------------------
def startServerByName(serverName, installDir=r'/Program Files/IBM/WebSphere/AppServer'):
   cmd = '"%s/bin/startServer.bat" %s' % (installDir, serverName)
   print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % (retval,serverName))

#---------------------------------------------------------------------------------------------
# Stop a server by name via WAS BAT script
#---------------------------------------------------------------------------------------------
def stopServerByName(serverName, adminName, adminPassword, installDir=r'/Program Files/IBM/WebSphere/AppServer'):
   cmd = '"%s/bin/stopServer.bat" %s -username %s -password %s' % (installDir, serverName, adminName, adminPassword)
   print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % (retval,serverName))

#---------------------------------------------------------------------------------------------
# Create a Windows service and start it
#---------------------------------------------------------------------------------------------
def createServiceAndStart(adminUsername, adminPassword, serviceName='was.server1', 
    serverName='server1', profileName='AppSrv01',
    installDir=r'/Program Files/IBM/WebSphere/AppServer'):

   #Use the wasservice.exe command to create the service
   cmd = ' "%s/bin/wasservice.exe" -add %s -serverName %s \
        -profilePath "%s/profiles/%s" -startType automatic \
        -stopArgs "-username %s -password %s" \
        -startArgs "-username %s -password %s" ' % (installDir,
            serviceName, serverName, installDir, profileName,
            adminUsername, adminPassword, adminUsername, adminPassword)
   #print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while creating WebSphere service %s' % (retval, serviceName))
   startWASService(serviceName, installDir)

#---------------------------------------------------------------------------------------------
# Create a Windows service with specified os user and start it
#---------------------------------------------------------------------------------------------
'''
def createServiceAndStartWithOSUser(osUserName, osUserPassword, adminUsername, adminPassword, serviceName='was.server1', 
    serverName='server1', profileName='AppSrv01',
    installDir=r'/Program Files/IBM/WebSphere/AppServer'):

   #Use the wasservice.exe command to create the service
   cmd = ' "%s/bin/wasservice.exe" -add %s -serverName %s -userid "%s" -password "%s" -profilePath "%s/profiles/%s" -startType automatic -stopArgs "-username %s -password %s" -startArgs "-username %s -password %s" '\
     % (installDir, serviceName, serverName, osUserName, osUserPassword, installDir, profileName, adminUsername, adminPassword, adminUsername, adminPassword)
   #print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while creating WebSphere service %s with specified user' % (retval, serviceName))
   startWASService(serviceName, installDir)
'''
#---------------------------------------------------------------------------------------------
# Start a server via Windows Service
#---------------------------------------------------------------------------------------------
def startWASService(serviceName, installDir=r'/Program Files/IBM/WebSphere/AppServer'):
   cmd = ' "%s/bin/wasservice.exe" -start %s' % (installDir, serviceName)
   print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % (retval, serviceName))


#---------------------------------------------------------------------------------------------
# Stop a server by Windows Service
#---------------------------------------------------------------------------------------------
def stopWASService(serviceName, installDir=r'/Program Files/IBM/WebSphere/AppServer'):
   cmd = ' "%s/bin/wasservice.exe" -stop %s' % (installDir, serviceName)
   print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while stopping server %s' % (retval, serviceName))
