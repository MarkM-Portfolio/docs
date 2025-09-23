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

CREATE TABLE CONCORDDB.SUBSCRIBER
    (ID varchar(128)  NOT NULL,
    CUSTOMER_ID varchar(128)  NOT NULL,
    TYPE smallint NOT NULL,
    DISPLAY_NAME varchar(128),
    EMAIL varchar(128),
    STATE varchar(32),
    ENTITLEMENT varchar(32),
    PRIMARY KEY(ID, TYPE) )
GO