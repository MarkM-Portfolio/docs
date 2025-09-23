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

CREATE TABLE CONCORDDB.PRODUCT
   (ID varchar(128)  NOT NULL,
    VERSION_MAJOR smallint DEFAULT 0 NOT NULL,
    VERSION_MINOR smallint DEFAULT 0 NOT NULL,
    VERSION_MILLI smallint DEFAULT 0 NOT NULL,
    VERSION_MICRO smallint DEFAULT 0 NOT NULL,
    SCHEMA_VERSION varchar(32) NOT NULL,    
    PRIMARY KEY(ID) )
GO

INSERT INTO CONCORDDB.PRODUCT
    (ID, VERSION_MAJOR, VERSION_MINOR, VERSION_MILLI, VERSION_MICRO, SCHEMA_VERSION)
    VALUES ('lotuslive.symphony',1,0,0,0,'1')
GO
