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

CREATE INDEX DOC_EDITORS_INDX 
    ON CONCORDDB.DOCEDITORS (DOCID)
GO

CREATE INDEX DOC_EDITORS_INDX2 
    ON CONCORDDB.DOCEDITORS (USERID, DOCID)
GO

