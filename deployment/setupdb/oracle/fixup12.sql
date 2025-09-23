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

CREATE TABLE "CONCORDDB"."USER_DOC_CACHE"  
(
		  "USER_ID" VARCHAR2(256) NOT NULL , 
		  "DOC_ID" VARCHAR2(256) NOT NULL , 
		  "CACHE_KEY" VARCHAR2(256) NOT NULL , 
		  "CACHE_VALUE" VARCHAR2(256) NOT NULL
)   
TABLESPACE "DOCSTS8";

ALTER TABLE "CONCORDDB"."USER_DOC_CACHE" ADD CONSTRAINT "USER_DOC_CACHE_PK" PRIMARY KEY ("USER_ID", "DOC_ID", "CACHE_KEY");

COMMIT;
QUIT;