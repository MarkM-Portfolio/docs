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

--CONNECT TO CONCORD@
ALTER SESSION SET CURRENT_SCHEMA = CONCORDDB;

ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("DOC_ID" VARCHAR(256));
ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("VERSION_SERIES_ID" VARCHAR(256));
ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("LIBRARY_ID" VARCHAR(256));
ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("COMMUNITY_ID" VARCHAR(256));

--REORG TABLE "CONCORDDB"."DOC_HISTORY"@

COMMIT;

QUIT;