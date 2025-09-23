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

CREATE TABLE CONCORDDB.DOC_HISTORY
    (REPO_ID varchar(256)  NOT NULL,
    URI varchar(2048)  NOT NULL,
    LAST_MODIFIED varchar(256),
    ORG_ID varchar(256),
    PRIMARY KEY(REPO_ID, URI) )
GO