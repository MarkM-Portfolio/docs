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

CREATE TABLE "CONCORDDB"."DOCUMENTSESSION"
(
	"REPOID" VARCHAR(256) NOT NULL,
	"DOCID" VARCHAR(256) NOT NULL,
	"SERVINGSERVER" VARCHAR(2048) NOT NULL,
	PRIMARY KEY("REPOID", "DOCID")
)	IN "CONCORDNAMESPACE"@

COMMIT WORK@
CONNECT RESET@