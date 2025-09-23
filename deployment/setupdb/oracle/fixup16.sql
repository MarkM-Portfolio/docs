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

CREATE TABLE "CONCORDDB"."DOC_REVISION" (
	"REPO_ID" VARCHAR2(256)  NOT NULL ,
	"DOC_ID" VARCHAR2(256)  NOT NULL ,
	"MAJOR_NO" INTEGER NOT NULL ,
	"MINOR_NO" INTEGER NOT NULL ,
	"REV_TYPE" VARCHAR2(256) NOT NULL ,
	"MODIFIERS" VARCHAR2(2048) ,
	"PUBLISH_DATE" TIMESTAMP,
	"LAST_MODIFIED" TIMESTAMP,
	"REFERENCE" VARCHAR2(256)
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."DOC_REVISION" ADD PRIMARY KEY ( "REPO_ID", "DOC_ID", "MAJOR_NO", "MINOR_NO");


CREATE INDEX "CONCORDDB"."DOC_REVISION_INDX" ON "CONCORDDB"."DOC_REVISION" ("REPO_ID", "DOC_ID");
              
CREATE INDEX "CONCORDDB"."DOC_REVISION_INDX2" ON "CONCORDDB"."DOC_REVISION" ("REPO_ID", "DOC_ID", "MAJOR_NO");

              
ALTER TABLE "CONCORDDB"."TASKHISTORY" MODIFY "CHANGESET" VARCHAR2(4000);              

COMMIT;
QUIT;
