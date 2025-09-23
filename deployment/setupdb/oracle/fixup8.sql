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

CREATE TABLE "CONCORDDB"."SUBSCRIBER"
(
	"ID" VARCHAR2(128) NOT NULL,
	"CUSTOMER_ID" VARCHAR2(128) NOT NULL,
	"TYPE" NUMBER(5) NOT NULL,
	"DISPLAY_NAME" VARCHAR2(128),
	"EMAIL" VARCHAR2(128),
	"STATE" VARCHAR2(32) NOT NULL,
	"ENTITLEMENT" VARCHAR2(32) NOT NULL
)
TABLESPACE "DOCSTS8";

ALTER TABLE "CONCORDDB"."SUBSCRIBER" ADD CONSTRAINT "SUBSCRIBER_PK" PRIMARY KEY ("ID", "TYPE");

COMMIT ;
QUIT;
