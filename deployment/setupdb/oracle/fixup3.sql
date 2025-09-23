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

ALTER TABLE "CONCORDDB"."USERPREFERENCE" DROP PRIMARY KEY DROP INDEX;
--ALTER TABLE CONCORDDB.USERPREFERENCE DROP PRIMARY KEY @

ALTER TABLE CONCORDDB.USERPREFERENCE DROP COLUMN "ID" ;
ALTER TABLE CONCORDDB.USERPREFERENCE ADD ("USER_ID" VARCHAR2(256) DEFAULT '' NOT NULL);
ALTER TABLE CONCORDDB.USERPREFERENCE ADD ( "PROP_KEY" VARCHAR2(256) DEFAULT '' NOT NULL);
ALTER TABLE CONCORDDB.USERPREFERENCE ADD ( "PROP_VALUE"  VARCHAR2(1024));
--REORG TABLE "CONCORDDB"."USERPREFERENCE" ;
ALTER TABLE CONCORDDB.USERPREFERENCE ADD CONSTRAINT "USERPREFERENCE_PK" PRIMARY KEY ( USER_ID, PROP_KEY)  ;
--REORG TABLE "CONCORDDB"."USERPREFERENCE" @

COMMIT;
QUIT;
