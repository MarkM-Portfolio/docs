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

--CONNECT TO CONCORD@
ALTER SESSION SET CURRENT_SCHEMA = CONCORDDB;

ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("DLAST_VISIT" TIMESTAMP);
ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("SLAST_VISIT" TIMESTAMP);
ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("UPLOAD_CREATED" TIMESTAMP);
ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD ("STATUS" NUMBER(5));

CREATE  INDEX CONCORDDB.DH_DLASTVISIT_INDEX ON CONCORDDB.DOC_HISTORY ("DLAST_VISIT" ASC);
CREATE  INDEX CONCORDDB.DH_SLASTVISIT_INDEX ON CONCORDDB.DOC_HISTORY ("SLAST_VISIT" ASC);
CREATE  INDEX CONCORDDB.DH_UPLOADCREATED_INDEX ON CONCORDDB.DOC_HISTORY ("UPLOAD_CREATED" ASC);
--REORG TABLE "CONCORDDB"."DOC_HISTORY"@

COMMIT;

QUIT;