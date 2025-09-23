-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2012. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

CONNECT TO CONCORD @
CREATE  SYSTEM TEMPORARY  TABLESPACE TEMPSPACEPK PAGESIZE 32 K  MANAGED BY AUTOMATIC STORAGE EXTENTSIZE 16 OVERHEAD 10.5 PREFETCHSIZE 16 TRANSFERRATE 0.14 BUFFERPOOL  CONCORDBUFFER @

ALTER TABLE CONCORDDB.DOCEDITORS ADD CONSTRAINT DOCEDITORS_PK PRIMARY KEY ( REPOID, DOCID, USERID) @
COMMIT WORK@
CONNECT RESET @