#!/usr/bin/python
##############################################################################################
#
# IBM Confidential
#
# OCO Source Materials
#
# Unique Identifier = L-MSCR-7BCD3
#
# (c) Copyright IBM Corp. 2008
# The source code for this program is not published or other-
# wise divested of its trade secrets, irrespective of what has
# been deposited with the U.S. Copyright Office.
###################################################################################

import os,subprocess,time,re,sys,base64,socket,smtplib,string,logging,logging.handlers,Queue,threading,shutil,traceback
from optparse import OptionParser
sys.path.append('/opt/ll/lib/registry')
from registryLib import *
os.umask(00022)

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------

#Parse the input options
parser = OptionParser()
parser.add_option("--propertyFile", dest="propertyFile", help="Property file.  Example: 'E2.properties'")
parser.add_option("-q", "--quiet", dest="quiet", action="store_true", help="Disable signoff prompt")
parser.add_option("--side", dest="side", help="Side to pull VIP information from")
(options, args) = parser.parse_args()

#If an input wasn't provided, throw an exception
if not options.propertyFile:
   raise Exception('Property file input not provided.  Execute python %s -h for usage\n' % (sys.argv[0]))

# Backup the current active configuration so we can identify the old active VIPs to down later.
if os.path.exists(options.propertyFile):
   os.system('mv -f %s %s.old' % (options.propertyFile,options.propertyFile))

#Initialize objects
registryParser = RegistryParser()

if not options.side:
    side = registryParser.getSide()
else:
    side = options.side

#Write the properties file
f = open(options.propertyFile,'w')
f.write('instanceUsername=%s\n' % (registryParser.getSetting('AC','database_instance_username')))
f.write('instancePort=%s\n' % (registryParser.getSetting('AC','database_instance_port')))
f.write('applicationUsername=%s\n' % (registryParser.getSetting('AC','database_application_username')))
#f.write('applicationPassword=%s\n' % (base64.b64encode(registryParser.getSetting('AC','database_application_password'))))
f.write('applicationPassword=%s\n' % (registryParser.getSetting('AC','database_application_password')))
f.write('side=%s\n' % (side))
f.write('docsDBName=%s\n' % (registryParser.getSetting('AC','db_docs')))

#Retrieve the VIPs,  add a netmask if not specified, and write to the property file
acVIP = registryParser.getSetting('F5','ac_db2_be_vip',side)
if acVIP and not acVIP.count('/'):
   acVIP += '/24'
elif not acVIP:
   acVIP = ''
f.write('acVIP=%s\n' % (acVIP))
try:
  docsVIP = registryParser.getSetting('F5','docs_db2_be_vip',side)
  if docsVIP and not docsVIP.count('/'):
     docsVIP += '/24'
  elif not docsVIP: 
     docsVIP = ''
except:
  docsVIP = ''
  print 'Can not find docs_db2_be_vip from F5 settings, you might need choose the latest F5 build'
  
f.write('docsVIP=%s\n' % (docsVIP))

#Write the data center type
f.write('dataCenterType=%s\n' % (registryParser.getSetting('MiddlewareZooKeeper','data_center_type')))

f.close()

#Validate the property file
for line in open(options.propertyFile,'r'):
   parts =  line.rstrip().split('=')
   key = parts[0]
   value = parts[1]
   if (value == 'None' or not value) and not key.count('VIP') and not key.count('side'):
      raise Exception('A value for %s is not set in the topology.  Please set a value, rebuild the topology, upgrade the Registry RPMs, and retry' % (key))

#Ensure the instance user can read & write the properties file
os.system('chown %s %s' % (registryParser.getSetting('AC','database_instance_username'),options.propertyFile))
os.system('chmod 750 %s' % (options.propertyFile))