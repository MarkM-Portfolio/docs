-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2015. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

USE CONCORD
GO

CREATE TABLE CONCORDDB.CUSTOMER_OAUTHTOKEN
    (REPOID varchar(256) NOT NULL,
	USERID varchar(256) NOT NULL,
	DOCID varchar(256) NOT NULL,
	ACCESSTOKEN varchar(2048) NOT NULL,
	REFRESHTOKEN varchar(2048),
	EXPIRETIME datetime2,
    PRIMARY KEY(REPOID, USERID, DOCID))
GO
