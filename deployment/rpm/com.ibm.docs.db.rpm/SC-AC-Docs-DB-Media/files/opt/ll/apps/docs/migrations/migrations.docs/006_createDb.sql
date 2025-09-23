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

CREATE TABLE "CONCORDDB"."DOC_REVISION" (
	"REPO_ID" VARCHAR (256)  NOT NULL ,
	"DOC_ID" VARCHAR (256)  NOT NULL ,
	"MAJOR_NO" INTEGER NOT NULL ,
	"MINOR_NO" INTEGER NOT NULL ,
	"REV_TYPE" VARCHAR(256) NOT NULL ,
	"MODIFIERS" VARCHAR(2048) ,
	"PUBLISH_DATE" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
	"LAST_MODIFIED" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
	"REFERENCE" VARCHAR(256) ,
	PRIMARY KEY ( "REPO_ID", "DOC_ID", "MAJOR_NO", "MINOR_NO")  )
IN "CONCORDNAMESPACE";

CREATE INDEX "CONCORDDB"."DOC_REVISION_INDX" ON "CONCORDDB"."DOC_REVISION" ("REPO_ID",
              "DOC_ID") ;

CREATE INDEX "CONCORDDB"."DOC_REVISION_INDX2" ON "CONCORDDB"."DOC_REVISION" ("REPO_ID",
              "DOC_ID", "MAJOR_NO") ;              

ALTER TABLE "CONCORDDB"."TASKHISTORY" ALTER COLUMN "CHANGESET" SET DATA TYPE VARCHAR (10240) ;              

COMMIT WORK;
CONNECT RESET;


--DISCONNECT ALL;
