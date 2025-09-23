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

CREATE TABLE CONCORDDB.CUSTOMER_CREDENTIAL
    (CUSTOMER_ID varchar(256) NOT NULL,
    [KEY] varchar(256) NOT NULL,
    VALUE varchar(2048) NOT NULL,
    PRIMARY KEY(CUSTOMER_ID, [KEY]) )
GO