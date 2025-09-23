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


CREATE TABLE CONCORDDB.TASK
    (TASK_ID varchar(256) NOT NULL,
    URI varchar(2048) NOT NULL,
    REPO_ID varchar(256) NOT NULL,
    AUTHOR varchar(256) NOT NULL,
    TASKSTATE varchar(256) NOT NULL,
    CREATEDATE datetime2 NOT NULL,
    DUEDATE datetime2 NOT NULL,
    LASTMODIFY datetime2 NOT NULL,
    ASSOCIATION_ID varchar(256) NOT NULL,
    TASKTITLE varchar(256),
    ASSIGNEE varchar(256),
    REVIEWER varchar(256),
    TASKCONTENT varchar(2048),
    VERSION_ID varchar(256),
    FRAGMENT_ID varchar(256),
    CHANGESET varchar(256),
    PRIMARY KEY(TASK_ID) )
GO

CREATE TABLE CONCORDDB.TASKHISTORY
    (HISTORY_ID varchar(256) NOT NULL,
    TASK_ID varchar(256) NOT NULL,
    CREATOR varchar(256) NOT NULL,
    CHANGESET varchar(2048) NOT NULL,
    ACTIONTYPE varchar(256) NOT NULL,
    ACTIONTIMESTAMP datetime2 NOT NULL,
    PRIMARY KEY(HISTORY_ID) )
GO

CREATE TABLE CONCORDDB.ASSOCIATEDWITH
    (ASSOCIATION_ID varchar(256) NOT NULL,
    ASSOCIATION_TYPE varchar(256) NOT NULL,
    LABEL varchar(2048) NOT NULL,
    ASSOCIATIONCONTENT varchar(2048),
    ASSOCIATION_TAG varchar(256),
    CHANGESET varchar(256),
    PRIMARY KEY(ASSOCIATION_ID) )
GO

CREATE TABLE CONCORDDB.MESSAGE
    (URI varchar(2048) NOT NULL,
    REPO_ID varchar(256) NOT NULL,
    USER_ID varchar(2048) NOT NULL,
    MESSAGE_TYPE varchar(256) NOT NULL,
    BYTESMESSAGE varchar(max) NOT NULL,
    MSGTIMESTAMP datetime2 NOT NULL,
    EXPIRATION datetime2 NOT NULL,
    DUEDATE datetime2 NOT NULL,
    CHANGESET varchar(256),
    PRIMARY KEY(URI, REPO_ID, USER_ID, MESSAGE_TYPE) )
GO

CREATE INDEX INDEX_TASKHISOTY_TASKID 
    ON CONCORDDB.TASKHISTORY (TASK_ID);
GO

CREATE INDEX INDEX_TASK_ASSOCIATION_ID 
    ON CONCORDDB.TASK (ASSOCIATION_ID);
GO

CREATE INDEX INDEX_TASK_URI 
    ON CONCORDDB.TASK (URI);
GO

CREATE INDEX INDEX_TASK_REPO_ID 
    ON CONCORDDB.TASK (REPO_ID);
GO

CREATE INDEX INDEX_TASK_ASSIGNEE 
    ON CONCORDDB.TASK (ASSIGNEE);
GO

CREATE INDEX INDEX_TASK_REVIEWER 
    ON CONCORDDB.TASK (REVIEWER);
GO

CREATE INDEX INDEX_TASK_TASKSTATE 
    ON CONCORDDB.TASK (TASKSTATE);
GO

CREATE INDEX INDEX_MESSAGE_EXPIRATION 
    ON CONCORDDB.MESSAGE (EXPIRATION);
GO

ALTER TABLE CONCORDDB.TASK
    ADD CONSTRAINT CONSTRAINT_TASK FOREIGN KEY ( ASSOCIATION_ID) REFERENCES CONCORDDB.ASSOCIATEDWITH (ASSOCIATION_ID) ON DELETE CASCADE ON UPDATE NO ACTION
GO

ALTER TABLE CONCORDDB.TASKHISTORY
    ADD CONSTRAINT CONSTRAINT_TASKHIS FOREIGN KEY ( TASK_ID) REFERENCES CONCORDDB.TASK (TASK_ID) ON DELETE CASCADE ON UPDATE NO ACTION
GO