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

CREATE TABLE "CONCORDDB"."PRODUCT"
(
	"ID" VARCHAR2(128) NOT NULL,
	"VERSION_MAJOR" NUMBER(5) DEFAULT 0 NOT NULL,
	"VERSION_MINOR" NUMBER(5) DEFAULT 0 NOT NULL,
	"VERSION_MILLI" NUMBER(5) DEFAULT 0 NOT NULL,
	"VERSION_MICRO" NUMBER(5) DEFAULT 0 NOT NULL,
	"SCHEMA_VERSION" VARCHAR2(32) NOT NULL
)
TABLESPACE "DOCSTS8";

ALTER TABLE "CONCORDDB"."PRODUCT" ADD CONSTRAINT "PRODUCT_PID" PRIMARY KEY ("ID");

INSERT INTO "CONCORDDB"."PRODUCT" ("ID","VERSION_MAJOR","VERSION_MINOR","VERSION_MILLI","VERSION_MICRO","SCHEMA_VERSION")
	VALUES ('lotuslive.symphony',1,0,0,0,'1');


COMMIT;

QUIT;