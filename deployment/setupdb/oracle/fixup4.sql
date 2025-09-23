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
ALTER SESSION SET CURRENT_SCHEMA = CONCORDDB;

--CONNECT TO CONCORD @
ALTER TABLE "CONCORDDB"."DOC_REFERENCE" ADD ("TASK_ID" VARCHAR2(256));
ALTER TABLE "CONCORDDB"."DOC_REFERENCE" ADD ("SUBMIT_TIME" TIMESTAMP);
ALTER TABLE "CONCORDDB"."DOC_REFERENCE" ADD ("CANCEL_TIME" TIMESTAMP);
--REORG TABLE "CONCORDDB"."DOC_REFERENCE" @

COMMIT;
QUIT;
