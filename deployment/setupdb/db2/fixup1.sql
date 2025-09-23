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

CONNECT TO CONCORD@

CREATE TABLE "CONCORDDB"."PRODUCT"
(
	"ID" VARCHAR(128) NOT NULL,
	"VERSION_MAJOR" SMALLINT DEFAULT 0 NOT NULL,
	"VERSION_MINOR" SMALLINT DEFAULT 0 NOT NULL,
	"VERSION_MILLI" SMALLINT DEFAULT 0 NOT NULL,
	"VERSION_MICRO" SMALLINT DEFAULT 0 NOT NULL,
	"SCHEMA_VERSION" VARCHAR(32) NOT NULL,
	PRIMARY KEY("ID")
)
IN "CONCORDNAMESPACE"@

INSERT INTO "CONCORDDB"."PRODUCT"
	("ID","VERSION_MAJOR","VERSION_MINOR","VERSION_MILLI","VERSION_MICRO","SCHEMA_VERSION")
	VALUES ('lotuslive.symphony',1,0,0,0,'1')@

COMMIT WORK@
CONNECT RESET@
