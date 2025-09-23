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


sys.path.append('/opt/ll/lib/websphere')
import wsadminlib

server_name = 'server1'
cell_name = wsadminlib.getCellName()
target_tree = '/tmp/targetTree.xml'

mbean= AdminControl.queryNames('type=TargetTreeMbean,process=%s,cell=%s,*' % (server_name,cell_name))
AdminControl.invoke(mbean, 'exportTargetTree', target_tree)


