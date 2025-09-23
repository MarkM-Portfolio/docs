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

CREATE TABLE "CONCORDDB"."SUBSCRIBER"
(
	"ID" VARCHAR(128) NOT NULL,
	"CUSTOMER_ID" VARCHAR(128) NOT NULL,
	"TYPE" SMALLINT NOT NULL,
	"DISPLAY_NAME" VARCHAR(128),
	"EMAIL" VARCHAR(128),
	"STATE" VARCHAR(32) NOT NULL,
	"ENTITLEMENT" VARCHAR(32) NOT NULL,
	PRIMARY KEY("ID", "TYPE")
)	IN "CONCORDNAMESPACE"@

COMMIT WORK@
CONNECT RESET@