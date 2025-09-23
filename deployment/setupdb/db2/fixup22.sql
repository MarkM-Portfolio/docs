-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2014. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

CONNECT TO CONCORD@

ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD COLUMN "AUTO_PUBLISH" VARCHAR(256) @
REORG TABLE "CONCORDDB"."DOC_HISTORY"@

COMMIT WORK@
CONNECT RESET@