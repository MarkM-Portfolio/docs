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

CREATE TABLE CONCORDDB.HKTASK
    (TASKID bigint NOT NULL,
    VERSION varchar(5) NOT NULL,
    ROW_VERSION int NOT NULL,
    TASKTYPE int NOT NULL ,
    TASKSUSPENDED smallint NOT NULL,
    CANCELLED smallint NOT NULL,
    NEXTFIRETIME bigint NOT NULL,
    STARTBYINTERVAL varchar(254),
    STARTBYTIME bigint,
    VALIDFROMTIME bigint,
    VALIDTOTIME bigint,
    REPEATINTERVAL varchar(254),
    MAXREPEATS int NOT NULL,
    REPEATSLEFT int NOT NULL,
    TASKINFO varbinary(max),
    NAME varchar(254) NOT NULL,
    AUTOPURGE int NOT NULL,
    FAILUREACTION int,
    MAXATTEMPTS int,
    QOS int,
    PARTITIONID int,
    OWNERTOKEN varchar(200) NOT NULL,
    CREATETIME bigint NOT NULL)
GO

ALTER TABLE CONCORDDB.HKTASK
   ADD PRIMARY KEY ( TASKID )
GO

CREATE INDEX HKTASK_IDX1 
    ON CONCORDDB.HKTASK (TASKID, OWNERTOKEN);
GO

CREATE INDEX HKTASK_IDX2 
    ON CONCORDDB.HKTASK (NEXTFIRETIME ASC, REPEATSLEFT, PARTITIONID);
GO

CREATE TABLE CONCORDDB.HKTREG
    (REGKEY varchar(254) NOT NULL,
    REGVALUE varchar(254))
GO

ALTER TABLE CONCORDDB.HKTREG
   ADD PRIMARY KEY ( REGKEY )
GO

CREATE TABLE CONCORDDB.HKLMGR
    (LEASENAME varchar(254) NOT NULL,
    LEASEOWNER varchar(254) NOT NULL,
    LEASE_EXPIRE_TIME bigint,
    DISABLED varchar(5) )
GO

ALTER TABLE CONCORDDB.HKLMGR
    ADD PRIMARY KEY ( LEASENAME )
GO

CREATE TABLE CONCORDDB.HKLMPR
    (LEASENAME varchar(254) NOT NULL,
    NAME varchar(254) NOT NULL,
    VALUE varchar(254) NOT NULL )
GO

CREATE INDEX HKLMPR_IDX1 
    ON CONCORDDB.HKLMPR (LEASENAME, NAME);
GO