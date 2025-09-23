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

CREATE TABLE CONCORDDB.DOCUMENTSESSION
    ( REPOID varchar(256) NOT NULL,
    DOCID varchar(256) NOT NULL,
    SERVINGSERVER varchar(2048) NOT NULL,
    PRIMARY KEY(REPOID, DOCID) )
GO
