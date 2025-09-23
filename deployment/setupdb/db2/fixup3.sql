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

CONNECT TO CONCORD @
ALTER TABLE CONCORDDB.USERPREFERENCE DROP PRIMARY KEY @
ALTER TABLE CONCORDDB.USERPREFERENCE DROP COLUMN "ID" @
ALTER TABLE CONCORDDB.USERPREFERENCE ADD COLUMN "USER_ID" VARCHAR (256) NOT NULL WITH DEFAULT '' @
ALTER TABLE CONCORDDB.USERPREFERENCE ADD COLUMN "PROP_KEY" VARCHAR(256) NOT NULL WITH DEFAULT '' @
ALTER TABLE CONCORDDB.USERPREFERENCE ADD COLUMN "PROP_VALUE"  VARCHAR(1024) @
REORG TABLE "CONCORDDB"."USERPREFERENCE" @
ALTER TABLE CONCORDDB.USERPREFERENCE ADD CONSTRAINT "USERPREFERENCE_PK" PRIMARY KEY ( USER_ID, PROP_KEY)  @
REORG TABLE "CONCORDDB"."USERPREFERENCE" @

COMMIT WORK@
CONNECT RESET @
