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


CREATE TABLE CONCORDDB.DOC_REVISION
    (REPO_ID varchar(256) NOT NULL,
    DOC_ID varchar(256) NOT NULL,
    MAJOR_NO int NOT NULL,
    MINOR_NO int NOT NULL,
    REV_TYPE varchar(256) NOT NULL,
    MODIFIERS varchar(2048) NOT NULL,
    PUBLISH_DATE datetime2 DEFAULT CURRENT_TIMESTAMP ,
    LAST_MODIFIED datetime2 DEFAULT CURRENT_TIMESTAMP,
    REFERENCE varchar(256) ,
    PRIMARY KEY(REPO_ID, DOC_ID, MAJOR_NO, MINOR_NO) )
GO

CREATE INDEX DOC_REVISION_INDX 
    ON CONCORDDB.DOC_REVISION (REPO_ID, DOC_ID)
GO

CREATE INDEX DOC_REVISION_INDX2 
    ON CONCORDDB.DOC_REVISION (REPO_ID, DOC_ID, MAJOR_NO)
GO

ALTER TABLE CONCORDDB.TASKHISTORY
    ALTER COLUMN CHANGESET varchar(max)
GO