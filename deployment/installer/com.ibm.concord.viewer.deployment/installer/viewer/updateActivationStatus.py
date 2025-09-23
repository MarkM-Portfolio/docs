##############################################################################################
#
# IBM Confidential
#
# OCO Source Materials
#
# Unique Identifier = L-MSCR-7BCD3
#
# (c) Copyright IBM Corp. 2012
# The source code for this program is not published or other-
# wise divested of its trade secrets, irrespective of what has
# been deposited with the U.S. Copyright Office.
##############################################################################################

import os, subprocess, time, re, sys
sys.path.append('/LotusLive/Lib')
from zooKeeperLib_win import *

#Validate the input arguments
if len(sys.argv) < 2:
   print('Error:  Incorrect number of arguments provided.  Expecting: <status> [<state>]')
   sys.exit(1)

#Set variables from the input arguments
status=sys.argv[1]
try:
   state=sys.argv[2]
except:
   state=None

#Consume the ZooKeeperClient object and publish the settings
zooKeeperClient = ZooKeeperClient()
if state:
   zooKeeperClient.updateActivationStatus(status,state)
else:
   zooKeeperClient.updateActivationStatus(status)

