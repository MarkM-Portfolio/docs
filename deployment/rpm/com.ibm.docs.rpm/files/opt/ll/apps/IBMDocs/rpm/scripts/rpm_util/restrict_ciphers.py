# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2018. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

import re, time, fileinput

DOCS_PROPERTIES_PATH = "/opt/IBM/WebSphere/AppServer/profiles/AppSrv01/properties/"
PROFILE_SSL_CLIENT_PROPS = "ssl.client.props"

#---------------------------------------------------------------------------------------------
# restrict ciphers
#---------------------------------------------------------------------------------------------  
def restrictCiphers():
    ciphers = AdminTask.listSSLCiphers(["-securityLevel", "HIGH"]).split("\n")
    adjustedCiphers = []
    for cipher in ciphers:
        if cipher.find("RC4") == -1 and cipher.find("DHE") == -1 and cipher.find("3DES") == -1:
            adjustedCiphers.append(cipher)
    
    sslConfigs = AdminTask.listSSLConfigs('[-all true]').split("\n")
    for config in sslConfigs:
        sslAlias = re.findall('(alias:)\s(\S+)', config)
        sslManagementScope = re.findall('(managementScope:)\s(\S+)', config)
        AdminTask.modifySSLConfig(["-alias", sslAlias[0][1], "-scopeName", sslManagementScope[0][1], "-sslProtocol", "SSL_TLSv2", "-securityLevel", "CUSTOM", "-enabledCiphers", " ".join(adjustedCiphers)])
    
    for line in fileinput.input(DOCS_PROPERTIES_PATH + PROFILE_SSL_CLIENT_PROPS, backup='.bak', inplace=1):  
        if line.startswith('com.ibm.ssl.protocol') and line.find('SSL_TLSv2') < 0:
            print 'com.ibm.ssl.protocol=SSL_TLSv2'
        else:
            print line.rstrip()

#---------------------------------------------------------------------------------------------
# restrict ciphers
#---------------------------------------------------------------------------------------------  
def disabledAlgorithms():
   AdminTask.setAdminActiveSecuritySettings('[-customProperties ["com.ibm.websphere.tls.disabledAlgorithms=TLSv1, 3DES, SSLv3, RC4, MD5withRSA, DH keySize < 1024, EC keySize < 224, DES keySize < 1024, RSA keySize < 1024, SHA1 keySize < 1024"]]')
   AdminTask.setAdminActiveSecuritySettings('[-customProperties ["com.ibm.websphere.certpath.disabledAlgorithms=3DES, MD2, MD5, SHA1 jdkCA & usage TLSServer, DH keySize < 1024, EC keySize < 224, DES keySize < 1024, RSA keySize < 1024, SHA1 keySize < 1024"]]')      

#---------------------------------------------------------------------------------------------
# Update generic JVM properties to enable TLSV1.1 and TLSV1.2 for NewRelic agent
#--------------------------------------------------------------------------------------------- 
def setGenericJVMProperty(args):
    serverName = args[0]
    nodeName = args[1]
    currentJVMArgs = AdminTask.showJVMProperties('[-serverName %s -nodeName %s  -propertyName genericJvmArguments]' % (serverName, nodeName))
    tlsJVMArg = '-Dcom.ibm.jsse2.overrideDefaultTLS=true'
    if currentJVMArgs.find(tlsJVMArg) == -1:
        AdminTask.setGenericJVMArguments('[-serverName %s -nodeName %s -genericJvmArguments "%s %s"]' % (serverName, nodeName, currentJVMArgs, tlsJVMArg))	
    	AdminConfig.save()
    	AdminConfig.reset()
    	print 'Generic JVM argument %s has been well configured!' % (tlsJVMArg)
    else:
        print 'The JVM argument %s has already existed.' % (tlsJVMArg) 
#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------  
if __name__ == '__main__' :
    import sys
    """
        #  required parameters
        #  serverName, nodeName
    """
    if len(sys.argv) < 2:
        print ">>> Errors for arguments number passed to restrict_ciphers"
        sys.exit()
    setGenericJVMProperty(sys.argv)
    restrictCiphers()
    disabledAlgorithms()
    AdminConfig.save()
    time.sleep(5) # We must allow time for the sslProtocol change to occur	
    print 'Medium strength ciphers 3DES has been removed successfully!'
    