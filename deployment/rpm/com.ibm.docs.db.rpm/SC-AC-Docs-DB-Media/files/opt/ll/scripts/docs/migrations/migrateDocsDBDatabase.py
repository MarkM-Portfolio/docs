##############################################################################################
#
# IBM Confidential
#
# OCO Source Materials
#
# Unique Identifier = L-MSCR-7BCD3
#
# (c) Copyright IBM Corp. 2016
# The source code for this program is not published or other-
# wise divested of its trade secrets, irrespective of what has
# been deposited with the U.S. Copyright Office.
###################################################################################

import os,subprocess,time,re,sys,base64,socket,httplib,urllib2,urllib,cookielib,smtplib,string,logging,Queue,threading,shutil
from optparse import OptionParser
os.umask(00022)

#---------------------------------------------------------------------------------------------
# A class for easily working with properties
#---------------------------------------------------------------------------------------------
class Properties:
   def __init__(self,envName):
      self.__envName = envName
      self.__properties = {}
      self.__propertiesFile = '%s.properties' % (envName)
      self.__retrievedProperties  = {}

      self.__requiredProperties = ['instanceUsername', 'schemaUsername', 'schemaPassword', 'port']

      print 'Reading properties from %s...' % (self.__propertiesFile)

      f = open(self.__propertiesFile)
      contents = f.readlines()
      f.close()

      for line in contents:
         line = line.rstrip('\n')

         if not line:
            continue

         if re.match('^#',line):
            continue

         if line.count('=') > 0:
            parts = line.split('=')
            key = line.split('=')[0]
            value = '='.join(line.split('=')[1:])

            #Uncomment the following 2 lines if the passwords are actually encoded for compliance reasons
            #if key.lower().count('password'):
            #   value = base64.b64decode(value)
            self.__properties[key] = value

   def getProperty(self,key):
      self.__retrievedProperties[key] = self.__properties[key]
      return self.__properties[key]
      
   def getRetrievedProperties(self):
      return self.__retrievedProperties

   def getPropertyFile(self):
      return self.__propertiesFile

   def verifyRequiredProperties(self):
      for requiredProperty in self.__requiredProperties:
         if not self.__properties[requiredProperty]:
            raise Exception('Error:  Properties file %s is missing value for %s' % (self.__propertiesFile,requiredProperty))

#---------------------------------------------------------------------------------------------
# Print a signoff
#---------------------------------------------------------------------------------------------
def printSignoff(optionsMap):

   keys = optionsMap.keys()
   keys.sort()

   print '\n*************************************************************************\n'
   print 'The following will be used during the execution of the automation:'
   for key in keys:
      value = optionsMap[key]
      if value:
         print '   %s: %s' % (key,value)
      else:
         print '   %s: <Optional and resolution failed, will not configure>' % (key)
   print '\n*************************************************************************\n'

   #raw_input('Press enter to continue or ctrl-c to abort.  Execute python %s -h for more details\n' % (sys.argv[0]))

#---------------------------------------------------------------------------------------------
# Method to log and execute a command line expression and throw an exception if the command fails. Accepts an obfuscate parameter to hide part of the command in the logging
#---------------------------------------------------------------------------------------------
def executeCommand(command, obfuscate=None):
    log = 'Executing: '
    if obfuscate:
        log += command.replace(obfuscate, '***')
    else:
        log +=  command
    print log
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print p.communicate()[0]
    if p.returncode:
        raise Exception('Error executing command: ' + command)
    print 'Command successful.'

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------

#Set variables

#Take note of the time
timestamp = time.localtime()

#Parse the input options
parser = OptionParser()
parser.add_option("--propertyFile", dest="propertyFile", help="Property file.  Example: 'E2.properties'")
parser.add_option("--databaseToUpgrade", dest="databaseToUpgrade", help="A singular database to upgrade in the event something goes wrong and you want to run just a portion of the code.  Example:  'docsDBName'")
(options, args) = parser.parse_args()

#If an input wasn't provided, throw an exception
if not options.propertyFile:
   raise Exception('Property file input not provided.  Execute python %s -h for usage\n' % (sys.argv[0]))

#Read in the properties
properties = Properties(options.propertyFile.replace('.properties',''))
instanceUsername = properties.getProperty('instanceUsername')
schemaUsername = properties.getProperty('schemaUsername')
schemaPassword = properties.getProperty('schemaPassword')
port = properties.getProperty('port')
docsDBName = properties.getProperty('docsDBName')

#Set a map with information for the user to review
optionsMap = properties.getRetrievedProperties()
optionsMap['propertyFile'] = options.propertyFile

#Print signoff
printSignoff(optionsMap)

#TODO:  Implementation that consumes the above properties goes from here down

#Perform actional actions within independent threads
threads = []

#Upgrade the Docs database  
if not options.databaseToUpgrade or (options.databaseToUpgrade and databaseToUpgrade == 'docsDBName'):
   command = '/opt/ll/scripts/docs/migrations/runIBMDocsDBMigration.sh true ' + instanceUsername + ' > /opt/ll/scripts/docs/logs/runIBMDocsDBMigration.sh.log 2>&1'    
   t = threading.Thread(target=executeCommand, name='Execute command: %s' % (command), args=([command]))
   threads.append(t)
   t.start()

#Wait for all of the threads to complete
for thread in threads:
   thread.join()

#TODO:  Process the output and archive it somewhere for reference
