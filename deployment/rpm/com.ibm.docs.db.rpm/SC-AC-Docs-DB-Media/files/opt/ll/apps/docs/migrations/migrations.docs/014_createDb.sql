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

CREATE TABLE "CONCORDDB"."CUSTOMER_CREDENTIAL" (
	"CUSTOMER_ID" VARCHAR (256)  NOT NULL ,
	"KEY" VARCHAR (256)  NOT NULL ,
	"VALUE" VARCHAR (2048)  NOT NULL ,
	PRIMARY KEY ( "CUSTOMER_ID", "KEY")  )
IN "CONCORDNAMESPACE";

COMMIT WORK;
CONNECT RESET;


--DISCONNECT ALL;
