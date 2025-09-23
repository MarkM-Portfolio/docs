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

# 5724-E76, 5724-L21, 5724-i67, 5724-L64, 5655-M44                  
import java.lang.String as jstr
import java.util.Properties as jprops
import java.io as jio
import javax.management as jmgmt

def printUsage():
    print ""
    print "Usage:  install_root/bin/wsadmin -lang jython"
    print "[-user username] [-password password]"
    print "-f LTPAKeyFile file_password"
    print "where install_root is the root directory for WebSphere"
    print "                    Application Server"
    print "      username     is the WebSphere Application Server"
    print "                    user"
    print "      password     is the user password"
    print "      LTPAKeyFile  is the file to which you are"
    print "                    exporting the LTPA keys"
    print "      key_password is the password that is used to"
    print "                    encrypt the exported keys"
    print ""
    print "Sample:"
    print "wsadmin -lang jython -user tipadmin -password admin123"
    print " -f \"c:\\temp\\exportLTPAKeys.py\""
    print " \"c:\\\\temp\\\\ltpakeys.txt\" admin123"
    print "===================================================================="
    print ""

# Verify that the correct number of parameters were passed
if not (len(sys.argv) == 2):
   sys.stderr.write("Invalid number of arguments\n")
   printUsage()
   sys.exit(101)

ltpaKeyFile=sys.argv[0]
password=jstr(sys.argv[1]).getBytes()

# This would have to change to the following if the deployment manager is not used
security=AdminControl.queryNames('*:*,name=SecurityAdmin')
#security=AdminControl.queryNames( 'process=dmgr,type=SecurityAdmin,*' )

securityON=jmgmt.ObjectName(security)

params=[password]
signature=['[B']

ltpaKeys=AdminControl.invoke_jmx(securityON,'exportLTPAKeys', params, signature)

fout=jio.FileOutputStream(ltpaKeyFile)

ltpaKeys.store(fout,'')
fout.close()
