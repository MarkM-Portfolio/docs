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

CREATE TABLE "CONCORDDB"."CUSTOMER_CREDENTIAL"
(
	"CUSTOMER_ID" VARCHAR2(256) NOT NULL,
	"KEY" VARCHAR2(256) NOT NULL,
	"VALUE" VARCHAR2(2048) NOT NULL
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."CUSTOMER_CREDENTIAL" ADD CONSTRAINT "CUSTOMER_CREDENTIAL_PK" PRIMARY KEY ("CUSTOMER_ID", "KEY");

COMMIT;
QUIT;