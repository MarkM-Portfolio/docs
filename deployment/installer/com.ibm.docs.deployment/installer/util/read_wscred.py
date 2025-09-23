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

import os, sys, getpass


def read_was_credential():
  sys.stdout.write("\nPlease enter the WebSphere Application Server credentials.\n\n")
  sys.stdout.write("WAS Administrative Username: ")
  name = sys.stdin.readline()[:-1]

  pw = getpass.getpass("WAS Administrator Password: ")
  return (name, pw)

def read_db_credential():
    sys.stdout.write('\nPlease enter the database server credentials.\n\n')
    sys.stdout.write('Type your privileged database user for DB2 or Microsoft Sql Server. For Oracle server please type "docsuser". :\n')
    name = sys.stdin.readline()[:-1]

    pw = getpass.getpass('Type your database user password\n')
    return (name, pw)
