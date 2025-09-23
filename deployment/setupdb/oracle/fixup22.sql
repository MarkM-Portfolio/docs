-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2015. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

--CONNECT TO CONCORD@
ALTER SESSION SET CURRENT_SCHEMA = CONCORDDB;

CREATE TABLE "CONCORDDB"."DOC_ENTITLEMENT"
(
	"LEVEL_ID" VARCHAR2 (128)  NOT NULL ,
	"LEVEL_NAME" VARCHAR2 (128)  ,
	"FEATURES" VARCHAR2 (2048)  ,
	"CREATEDATE" TIMESTAMP  NOT NULL 
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."DOC_ENTITLEMENT" ADD PRIMARY KEY ("LEVEL_ID");

CREATE TABLE "CONCORDDB"."ORG_ENTITLEMENT" 
(
	"ORG_ID" VARCHAR2 (128)  NOT NULL ,
	"ORG_NAME" VARCHAR2 (128) ,
	"LEVEL_ID" VARCHAR2 (128)
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."ORG_ENTITLEMENT" ADD PRIMARY KEY ("ORG_ID");

CREATE TABLE "CONCORDDB"."USER_ENTITLEMENT" 
(
	"USER_ID" VARCHAR2 (128)  NOT NULL ,
	"ORG_ID" VARCHAR2 (128)  NOT NULL  ,
	"LEVEL_ID" VARCHAR2 (128)
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."USER_ENTITLEMENT" ADD PRIMARY KEY ("USER_ID","ORG_ID");

CREATE INDEX "CONCORDDB"."DOC_ENTITLEMENT_INDX" ON "CONCORDDB"."DOC_ENTITLEMENT" ("LEVEL_NAME"); 
CREATE INDEX "CONCORDDB"."ORG_ENTITLEMENT_INDX" ON "CONCORDDB"."ORG_ENTITLEMENT" ("LEVEL_ID");
CREATE INDEX "CONCORDDB"."USER_ENTITLEMENT_INDX" ON "CONCORDDB"."USER_ENTITLEMENT" ("LEVEL_ID");

COMMIT;
QUIT;
