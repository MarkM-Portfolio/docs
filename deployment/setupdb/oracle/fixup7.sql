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

--CONNECT TO CONCORD @
ALTER SESSION SET CURRENT_SCHEMA = CONCORDDB;

CREATE TABLE "CONCORDDB"."DOC_HISTORY"  (
		  "REPO_ID" VARCHAR2(256) NOT NULL ,
		  "URI" VARCHAR2(2048) NOT NULL ,
		  "LAST_MODIFIED" VARCHAR2(256) ,
		  "ORG_ID" VARCHAR2(256))   
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."DOC_HISTORY" ADD PRIMARY KEY ("REPO_ID", "URI");

COMMIT;
QUIT;