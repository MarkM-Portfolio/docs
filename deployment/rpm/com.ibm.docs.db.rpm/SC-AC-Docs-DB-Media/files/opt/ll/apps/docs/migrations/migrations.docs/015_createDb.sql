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

ALTER TABLE "CONCORDDB"."DOC_ENTITLEMENT" ALTER COLUMN "FEATURES" SET DATA TYPE VARCHAR (20480);
              
COMMIT WORK;
CONNECT RESET;


--DISCONNECT ALL;
