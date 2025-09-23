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

--CONNECT TO CONCORD@
ALTER SESSION SET CURRENT_SCHEMA = CONCORDDB;

ALTER TABLE "CONCORDDB"."SUBSCRIBER" MODIFY ("EMAIL" VARCHAR(255));
ALTER TABLE "CONCORDDB"."SUBSCRIBER" ADD ("LOCALE" VARCHAR(32));

--REORG TABLE "CONCORDDB"."SUBSCRIBER"@

COMMIT;

QUIT;
