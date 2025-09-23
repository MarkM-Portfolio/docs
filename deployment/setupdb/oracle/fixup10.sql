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

CREATE TABLE "CONCORDDB"."DOCUMENTSESSION"
(
	"REPOID" VARCHAR2(256) NOT NULL,
	"DOCID" VARCHAR2(256) NOT NULL,
	"SERVINGSERVER" VARCHAR2(2048) NOT NULL
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."DOCUMENTSESSION" ADD CONSTRAINT "DOCUMENTSESSION_PK" PRIMARY KEY ("REPOID", "DOCID");

COMMIT;
QUIT;