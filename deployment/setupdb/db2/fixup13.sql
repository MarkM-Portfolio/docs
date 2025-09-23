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

CREATE TABLE "CONCORDDB"."DOC_RECENTS" (
	"USER_ID" VARCHAR (256)  NOT NULL ,
	"REPO_ID" VARCHAR (256)  NOT NULL ,
	"DOC_ID" VARCHAR (256)  NOT NULL ,
	"RECENT_RANK" BIGINT  NOT NULL  GENERATED ALWAYS AS IDENTITY (START WITH 0, INCREMENT BY 1, CACHE 2)  ,
	PRIMARY KEY ( "USER_ID", "REPO_ID", "DOC_ID")  )
IN "CONCORDNAMESPACE"@

COMMIT WORK@
CONNECT RESET@