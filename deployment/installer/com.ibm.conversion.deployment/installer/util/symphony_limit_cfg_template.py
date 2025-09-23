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


LIMIT_CFG_TEMPLATE = \
'''
/*the record rule: <level info>.<SettingsName>=<SettingsValue>*/
/*Level info: starts from 1, 0 means no need for limitation check*/
/*SettingsName: should not contain "."*/
/*SettingsValue: the type should be int*/
/*All the notes or comments in this configure file should be in /**/ in each line*/

[TEXT]
/*Max pages in the file*/wel
1.MAXPAGE=%(document_max_page)s
2.MAXPAGE=%(document_max_page)s

[PRES]
/*Max pages in the file, including master/layout/normal/notes*/
1.MAXPAGE=%(presentation_max_page)s
2.MAXPAGE=%(presentation_max_page)s

[SHEET]
/*Max row in worksheet*/
1.MAXROW=%(spreadSheet_max_row)s
2.MAXROW=%(spreadSheet_max_row)s
'''
