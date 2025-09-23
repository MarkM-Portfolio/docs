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

CREATE TABLE "CONCORDDB"."CUSTOMER_OAUTHTOKEN"
(
	"REPOID" VARCHAR(256) NOT NULL,
	"USERID" VARCHAR(256) NOT NULL,
	"DOCID" VARCHAR(256) NOT NULL,
	"ACCESSTOKEN" VARCHAR(2048) NOT NULL,
	"REFRESHTOKEN" VARCHAR(2048),
	"EXPIRETIME" TIMESTAMP
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."CUSTOMER_OAUTHTOKEN" ADD CONSTRAINT "CUSTOMER_OAUTHTOKEN_PK" PRIMARY KEY ("REPOID", "USERID", "DOCID");

COMMIT;
QUIT;
