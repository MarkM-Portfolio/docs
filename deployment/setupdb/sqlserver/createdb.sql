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

CREATE DATABASE CONCORD
GO

USE CONCORD
GO

CREATE SCHEMA CONCORDDB
GO

CREATE USER [$(id)] FROM LOGIN [$(id)];

EXEC sp_addrolemember 'db_owner', '$(id)'


CREATE TABLE CONCORDDB.USERPREFERENCE
   (ID varchar(2048) NOT NULL,
    ORGID varchar(256),
    PREFERENCE varbinary(4096),
    PRIMARY KEY(ID) )
GO

CREATE TABLE CONCORDDB.DOCEDITORS
   (REPOID varchar(2048) NOT NULL,
    DOCID varchar(2048) NOT NULL,
    USERID varchar(2048) NOT NULL,
    ORGID varchar(2048) NOT NULL,
    DISPLAYNAME varchar(2048),
    COLOR varchar(64) NOT NULL,)
GO

CREATE TABLE CONCORDDB.DOC_ACTIVITY
   (REPO_ID varchar(256)  NOT NULL,
    URI varchar(256)  NOT NULL,
    ACTIVITY_ID varchar(256) NOT NULL,
    ORGID varchar(256) NOT NULL,
    CREATEDBY varchar(256) NOT NULL,
    CREATIONDATE datetime2,
    PRIMARY KEY(REPO_ID, URI))
GO

CREATE TABLE CONCORDDB.DOC_REFERENCE
   (PARENT_REPO varchar(256)  NOT NULL,
    PARENT_URI varchar(256)  NOT NULL,
    CHILD_REPO varchar(256) NOT NULL,
    CHILD_URI varchar(256) NOT NULL,
    ORGID varchar(256),
    CREATEDBY varchar(256),
    CREATIONDATE datetime2,
    PRIMARY KEY(PARENT_REPO, PARENT_URI, CHILD_REPO, CHILD_URI) )
GO

CREATE TABLE CONCORDDB.CLIPBOARD
   (ID varchar(2048)  NOT NULL,
    USERID varchar(2048)  NOT NULL,
    ORGID varchar(256) NOT NULL,
    USEREMAIL varchar(1024) NOT NULL,
    TAG varchar(1024),
    PROVIDERS varchar(2048),
    CLIPDATA varchar(max),
    LASTMODIFICATIONDATE datetime2,
    PRIMARY KEY(ID) )
GO

