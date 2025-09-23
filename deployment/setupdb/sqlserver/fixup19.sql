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

ALTER TABLE CONCORDDB.DOC_HISTORY
    ADD DOC_ID varchar(256),  VERSION_SERIES_ID varchar(256), LIBRARY_ID varchar(256), COMMUNITY_ID varchar(256)
GO