-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2018. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD COLUMN "DLAST_VISIT" TIMESTAMP ADD COLUMN "SLAST_VISIT" TIMESTAMP ADD COLUMN "UPLOAD_CREATED" TIMESTAMP ADD COLUMN "STATUS" SMALLINT;
REORG TABLE "CONCORDDB"."DOC_HISTORY";

CREATE INDEX "CONCORDDB"."DH_DLASTVISIT_INDEX" ON "CONCORDDB"."DOC_HISTORY" ("DLAST_VISIT");
CREATE INDEX "CONCORDDB"."DH_SLASTVISIT_INDEX" ON "CONCORDDB"."DOC_HISTORY" ("SLAST_VISIT");
CREATE INDEX "CONCORDDB"."DH_UPLOADCREATED_INDEX" ON "CONCORDDB"."DOC_HISTORY" ("UPLOAD_CREATED");

COMMIT WORK;
CONNECT RESET;


--DISCONNECT ALL;
