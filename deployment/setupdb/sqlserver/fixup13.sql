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


CREATE TABLE CONCORDDB.DOC_RECENTS
    (USER_ID varchar(256) NOT NULL,
    REPO_ID varchar(256) NOT NULL,
    DOC_ID varchar(256) NOT NULL,
    RECENT_RANK bigint NOT NULL IDENTITY(0,1) ,
    PRIMARY KEY(USER_ID, REPO_ID, DOC_ID) )
GO