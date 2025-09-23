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

--CONNECT TO CONCORD@

--ALTER BUFFERPOOL CONCORDBUFFER IMMEDIATE SIZE 8000 AUTOMATIC@
-- So this fixup did nothing, the bufferpool change above is for db2 only
-- keeping this fixup is to make consitence with DB2 fixup order
  
COMMIT;
QUIT;
