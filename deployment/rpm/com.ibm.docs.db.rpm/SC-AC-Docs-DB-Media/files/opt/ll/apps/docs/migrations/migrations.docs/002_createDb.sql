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

CREATE TABLE "CONCORDDB"."USER_DOC_CACHE"  
(
		  "USER_ID" VARCHAR(256) NOT NULL , 
		  "DOC_ID" VARCHAR(256) NOT NULL , 
		  "CACHE_KEY" VARCHAR(256) NOT NULL , 
		  "CACHE_VALUE" VARCHAR(256) NOT NULL ,
		  PRIMARY KEY("USER_ID", "DOC_ID", "CACHE_KEY")
)   
IN "CONCORDNAMESPACE" ;

COMMIT WORK;
CONNECT RESET;


--DISCONNECT ALL;
