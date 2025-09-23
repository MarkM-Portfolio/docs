-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2016. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

CONNECT TO CONCORD@

CREATE TABLE "CONCORDDB"."CUSTOMER_OAUTHTOKEN"
(
	"REPOID" VARCHAR(256) NOT NULL,
	"USERID" VARCHAR(256) NOT NULL,
	"DOCID" VARCHAR(256) NOT NULL,
	"ACCESSTOKEN" VARCHAR(2048) NOT NULL,
	"REFRESHTOKEN" VARCHAR(2048),
	"EXPIRETIME" TIMESTAMP,
	
	PRIMARY KEY("REPOID", "USERID", "DOCID")
)	IN "CONCORDNAMESPACE"@

COMMIT WORK@
CONNECT RESET@
