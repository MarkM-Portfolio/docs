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

CREATE TABLE CONCORDDB.DOC_ENTITLEMENT
    (LEVEL_ID varchar(128) NOT NULL,
    LEVEL_NAME varchar(128) NOT NULL,
    FEATURES varchar(2048),
    CREATEDATE datetime2 NOT NULL,
    PRIMARY KEY(LEVEL_ID))
GO

CREATE TABLE CONCORDDB.ORG_ENTITLEMENT
    (ORG_ID varchar(128) NOT NULL,
    ORG_NAME varchar(128),
    LEVEL_ID varchar(128),
    PRIMARY KEY(ORG_ID))
GO

CREATE TABLE CONCORDDB.USER_ENTITLEMENT
    (USER_ID varchar(128) NOT NULL,
    ORG_ID varchar(128) NOT NULL,
    LEVEL_ID varchar(128),
    PRIMARY KEY(USER_ID, ORG_ID))
GO

CREATE INDEX DOC_ENTITLEMENT_INDX 
    ON CONCORDDB.DOC_ENTITLEMENT (LEVEL_NAME)
GO

CREATE INDEX ORG_ENTITLEMENT_INDX 
    ON CONCORDDB.DOC_ENTITLEMENT (LEVEL_ID)
GO

CREATE INDEX USER_ENTITLEMENT_INDX 
    ON CONCORDDB.DOC_ENTITLEMENT (LEVEL_ID)
GO