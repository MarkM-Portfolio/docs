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

CREATE TABLE "CONCORDDB"."DOC_HISTORY"  (
		  "REPO_ID" VARCHAR(256) NOT NULL ,
		  "URI" VARCHAR(2048) NOT NULL ,
		  "LAST_MODIFIED" VARCHAR(256) ,
		  "ORG_ID" VARCHAR(256) ,
		  PRIMARY KEY("REPO_ID", "URI"))   
		 IN "CONCORDNAMESPACE" @

COMMIT WORK@
CONNECT RESET @