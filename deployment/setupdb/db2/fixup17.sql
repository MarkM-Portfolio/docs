-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2012. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

CONNECT TO CONCORD@

CREATE INDEX "CONCORDDB"."DOC_EDITORS_INDX" ON "CONCORDDB"."DOCEDITORS" ("DOCID") @
              
CREATE INDEX "CONCORDDB"."DOC_EDITORS_INDX2" ON "CONCORDDB"."DOCEDITORS" ("USERID","DOCID") @

COMMIT WORK@
CONNECT RESET@