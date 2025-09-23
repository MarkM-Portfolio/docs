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

CREATE TABLE "CONCORDDB"."DOC_RECENTS" (
	"USER_ID" VARCHAR2(256)  NOT NULL ,
	"REPO_ID" VARCHAR2(256)  NOT NULL ,
	"DOC_ID" VARCHAR2(256)  NOT NULL ,
	"RECENT_RANK" NUMBER(38)  NOT NULL  
)
TABLESPACE "DOCSTS8";

ALTER TABLE "CONCORDDB"."DOC_RECENTS" ADD CONSTRAINT "DOC_RECENTS_PK" PRIMARY KEY ("USER_ID", "REPO_ID", "DOC_ID");

-- DB2: GENERATED ALWAYS AS IDENTITY (START WITH 0, INCREMENT BY 1, CACHE 2) 

-- There is no IDENTIFY as above in oracle, so we must create an autonumber field by using sequence,
-- and then create a trigger to make the increase on INSERT statement

CREATE SEQUENCE "CONCORDDB"."DOC_RECENTS_SEQ"
  MINVALUE 0
  START WITH 0
  INCREMENT BY 1
  CACHE 20;

CREATE OR REPLACE TRIGGER DOC_RECENTS_TRG
  BEFORE INSERT ON "CONCORDDB"."DOC_RECENTS"
  FOR EACH ROW
  BEGIN
    SELECT "CONCORDDB"."DOC_RECENTS_SEQ".NEXTVAL INTO :NEW.RECENT_RANK from DUAL;
  end;
/
  
COMMIT;
QUIT;