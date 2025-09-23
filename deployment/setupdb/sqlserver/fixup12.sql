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


CREATE TABLE CONCORDDB.USER_DOC_CACHE
    (USER_ID varchar(256) NOT NULL,
    DOC_ID varchar(256) NOT NULL,
    CACHE_KEY varchar(256) NOT NULL,
    CACHE_VALUE varchar(256) NOT NULL,
    PRIMARY KEY(USER_ID, DOC_ID, CACHE_KEY) )
GO