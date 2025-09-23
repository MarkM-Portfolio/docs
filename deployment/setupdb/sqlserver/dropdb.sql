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

DROP DATABASE CONCORD
GO

IF EXISTS(SELECT * from sys.databases WHERE name='CONCORD')
BEGIN
    ALTER DATABASE CONCORD SET SINGLE_USER WITH ROLLBACK IMMEDIATE	
    DROP DATABASE CONCORD;
END
