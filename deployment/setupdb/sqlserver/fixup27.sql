-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2018. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

USE CONCORD
GO

ALTER TABLE CONCORDDB.DOC_HISTORY
    ADD DLAST_VISIT datetime2
GO

ALTER TABLE CONCORDDB.DOC_HISTORY
    ADD SLAST_VISIT datetime2
GO

ALTER TABLE CONCORDDB.DOC_HISTORY
    ADD UPLOAD_CREATED datetime2
GO

ALTER TABLE CONCORDDB.DOC_HISTORY
    ADD STATUS  smallint
GO

CREATE INDEX DH_DLASTVISIT_INDEX 
    ON CONCORDDB.DOC_HISTORY (DLAST_VISIT);
GO

CREATE INDEX DH_SLASTVISIT_INDEX 
    ON CONCORDDB.DOC_HISTORY (SLAST_VISIT);
GO

CREATE INDEX DH_UPLOADCREATED_INDEX 
    ON CONCORDDB.DOC_HISTORY (UPLOAD_CREATED);
GO
