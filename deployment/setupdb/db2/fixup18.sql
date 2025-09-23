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

ALTER TABLE "CONCORDDB"."DOCEDITORS" ADD COLUMN "INDICATORS" blob(1024K) @
ALTER TABLE "CONCORDDB"."DOC_RECENTS" ADD COLUMN "DOC_TITLE" VARCHAR(512) @

COMMIT WORK@
CONNECT RESET@