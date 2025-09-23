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

CREATE TABLE "CONCORDDB"."DOC_ENTITLEMENT" (
	"LEVEL_ID" VARCHAR (128)  NOT NULL ,
	"LEVEL_NAME" VARCHAR (128)  ,
	"FEATURES" VARCHAR (2048)  ,
	"CREATEDATE" TIMESTAMP  NOT NULL  ,
 	PRIMARY KEY("LEVEL_ID"))
	IN "CONCORDNAMESPACE";

CREATE TABLE "CONCORDDB"."ORG_ENTITLEMENT" (
	"ORG_ID" VARCHAR (128)  NOT NULL ,
	"ORG_NAME" VARCHAR (128) ,
	"LEVEL_ID" VARCHAR (128) ,
	PRIMARY KEY("ORG_ID"))
	IN "CONCORDNAMESPACE";

CREATE TABLE "CONCORDDB"."USER_ENTITLEMENT" (
	"USER_ID" VARCHAR (128)  NOT NULL ,
	"ORG_ID" VARCHAR (128)  NOT NULL  ,
	"LEVEL_ID" VARCHAR (128)  ,
	PRIMARY KEY("USER_ID","ORG_ID"))
	IN "CONCORDNAMESPACE";

CREATE INDEX "CONCORDDB"."DOC_ENTITLEMENT_INDX" ON "CONCORDDB"."DOC_ENTITLEMENT" ("LEVEL_NAME");
CREATE INDEX "CONCORDDB"."ORG_ENTITLEMENT_INDX" ON "CONCORDDB"."ORG_ENTITLEMENT" ("LEVEL_ID");
CREATE INDEX "CONCORDDB"."USER_ENTITLEMENT_INDX" ON "CONCORDDB"."USER_ENTITLEMENT" ("LEVEL_ID");
              
COMMIT WORK;
CONNECT RESET;


--DISCONNECT ALL;
