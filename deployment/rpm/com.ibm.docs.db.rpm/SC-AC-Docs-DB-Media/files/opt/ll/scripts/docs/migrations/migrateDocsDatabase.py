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
sys.path.append('/opt/ll/lib/db2/utils')
from migration import *
os.umask(00022)

overrideNodeCheck = False

# Check to see if neither tag file is available. If they are not, override the check and assume one acdb2 node
if not os.path.isfile('/opt/ll/media/db2/AC1.txt') and not os.path.isfile('/opt/ll/media/db2/AC2.txt') and not os.path.isfile('/opt/ll/media/db2/AC3.txt'):
    overrideNodeCheck = True
    
def isDatabaseAvailable(db2_node):
    if overrideNodeCheck:
        return True
    
    #see if the tag file corresponding to the db2 node exists, if it is does, return true
    tagFile = '/opt/ll/media/db2/AC' + db2_node + '.txt'
    
    if os.path.isfile(tagFile):
        return True
    
    return False


#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------

#Parse the input options
parser = OptionParser()
parser.add_option("--propertyFile", dest="propertyFile", help="Property file.  Example: 'E2.properties'")
parser.add_option("--databaseToUpgrade", dest="databaseToUpgrade", help="A singular database to upgrade in the event something goes wrong and you want to run just a portion of the code.  Example:  'CLPRDCOM'")
parser.add_option("--withLogTag", dest="withLogTag", help="A comma separated string of databases to upgrade that match the configured log tag.  Example:  'commons'.  Example 2:  'commons,analytics'")
parser.add_option("--logDir", dest="logDir", help="The location for the logs.  Example:  '/tmp/20141020.1312'")
parser.add_option("--logRecipients", dest="logRecipients", help="The users to be mailed the log files.  Example:  'user1@us.ibm.com,user2@us.ibm.com'")
parser.add_option("-q", "--quiet", dest="quiet", action="store_true", help="Disable signoff prompt")
parser.add_option("-t", "--test", dest="test", action="store_true", help="Do not run any of the actual upgrades, but verify all of the code paths")
parser.add_option("-s", "--step", dest="step", action="store_true", help="Run the migrations one by one and pause for user input")
parser.add_option("-m", "--controlVIPsManually", dest="controlVIPsManually", action="store_true", help="Do not automatically control the virtual ip addresses")
(options, args) = parser.parse_args()

#If an input wasn't provided, throw an exception
if not options.propertyFile:
   raise Exception('Property file input not provided.  Execute python %s -h for usage\n' % (sys.argv[0]))
   
#Read in the standard properties
properties = Properties(options.propertyFile.replace('.properties',''))
instanceUsername = properties.getProperty('instanceUsername')
instancePort = properties.getProperty('instancePort')
applicationUsername = properties.getProperty('applicationUsername')
applicationPassword = properties.getProperty('applicationPassword')
dataCenterType = properties.getProperty('dataCenterType')
side = properties.getProperty('side')

#Set a map with information for the user to review
optionsMap = properties.getRetrievedProperties()
optionsMap['propertyFile'] = options.propertyFile
optionsMap['quiet'] = options.quiet
optionsMap['logRecipients'] = options.logRecipients

#Print signoff
printSignoff(optionsMap)

#Create a Databases object to set top level properties
acDatabases = Databases(instanceUsername,instancePort,applicationUsername,applicationPassword,dataCenterType,options.logDir)
acDatabases.addFileToVerifyPermissions('/tmp')
acDatabases.addFileToVerifyPermissions('/opt/ll/scripts/ac/php_includes/migrateDB.php')
if options.step:
   acDatabases.enableStepping()
if options.withLogTag:
   acDatabases.setDatabasesToUpgradeWithLogTag(options.withLogTag)
if options.databaseToUpgrade:
   acDatabases.setDatabaseToUpgrade(options.databaseToUpgrade)

acDatabases.setSide(side)
if options.logRecipients:
   acDatabases.setLogRecipients(options.logRecipients)
if options.controlVIPsManually:
   acDatabases.controlVIPsManually()

#Verify the current operating environment has access to DB2
acDatabases.verifyDB2Env()


#Migrate the Commons DB
if (isDatabaseAvailable('1')):
    
    database = Database()
    database.setDatabaseName(properties.getProperty('docsDBName'))
    database.setUpgradeCommand('cd /opt/ll/apps/docs/migrations; php /opt/ll/scripts/ac/php_includes/migrateDB.php docs @@@DatabaseName@@@ @@@InstancePort@@@ @@@ApplicationUsername@@@ @@@ApplicationPassword@@@ -1 false')
    #TODO: what's the post script here
#     database.setPostUpgradeCommand('sh /opt/ll/scripts/ac/enableNormalisation.sh')
    database.addFileToVerifyPermissions('/opt/ll/apps/docs/migrations')
    database.setLogTag('docs')
    database.setPriority(1)
    database.setRPMDependency('SC-AC-Docs-DB-Media')
    backendAdapterSuffix = '_docs'
    docsVIP = properties.getProperty('docsVIP')
    logger.info('get docsVIP %s' % (docsVIP))
    #TODO: the flag here might be the options to indicate whether docs is ma which can tell from DocsLegacyComponent or DocsComponent
    if not docsVIP: 
        docsVIP = properties.getProperty('acVIP') 
        logger.info('get docsVIP %s from acVIP' % (docsVIP));
        backendAdapterSuffix = '_ac'
    database.setBackEndIPAddress(docsVIP)    
    database.setBackEndAdapterSuffix(backendAdapterSuffix)
    acDatabases.setBackEndIPAddress(docsVIP)
    acDatabases.setBackEndAdapterSuffix(backendAdapterSuffix)
    acDatabases.addDatabase(database)

#Verify read, write, and execute permissions for the files
acDatabases.verify()

#If the test parameter was passed in, abort
if options.test:
   logger.info('Executed with test flow.  Aborting...')
   sys.exit(0)

#Upgrade the databases
acDatabases.upgradeDatabases()

#Retrieve the results and return accordingly
numFailures = acDatabases.getNumFail()
logger.info('Migration of Commons DB complete with an exit status of %s' % (numFailures))
sys.exit(numFailures)
