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

CONNECT TO CONCORD @
ALTER TABLE "CONCORDDB"."DOC_REFERENCE" ADD COLUMN "TASK_ID" VARCHAR (256) @
ALTER TABLE "CONCORDDB"."DOC_REFERENCE" ADD COLUMN "SUBMIT_TIME" TIMESTAMP @
ALTER TABLE "CONCORDDB"."DOC_REFERENCE" ADD COLUMN "CANCEL_TIME" TIMESTAMP @
REORG TABLE "CONCORDDB"."DOC_REFERENCE" @
COMMIT WORK@
CONNECT RESET @
