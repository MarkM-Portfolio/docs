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

DECLARE @key_name varchar(1024)

SELECT @key_name = 
( SELECT name FROM sys.key_constraints WHERE type = 'PK' AND OBJECT_NAME(parent_object_id) = 'USERPREFERENCE')


DECLARE @SQL varchar(1024)
SELECT @SQL = 'ALTER TABLE CONCORDDB.USERPREFERENCE DROP CONSTRAINT ' +  @key_name
Exec (@SQL)

ALTER TABLE CONCORDDB.USERPREFERENCE
	DROP COLUMN ID
GO

ALTER TABLE CONCORDDB.USERPREFERENCE
    ADD USER_ID varchar(256) NOT NULL DEFAULT '', PROP_KEY varchar(256) NOT NULL DEFAULT '', PROP_VALUE varchar(1024)
GO

ALTER TABLE CONCORDDB.USERPREFERENCE
    ADD CONSTRAINT USERPREFERENCE_PK PRIMARY KEY ( USER_ID, PROP_KEY)
GO