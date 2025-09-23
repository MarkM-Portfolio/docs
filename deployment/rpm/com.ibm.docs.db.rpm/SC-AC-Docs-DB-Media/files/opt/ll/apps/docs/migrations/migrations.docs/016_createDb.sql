-- ***************************************************************** 
--                                                                   
-- IBM Confidential                                                  
--                                                                   
-- IBM Docs Source Materials                                         
--                                                                   
-- (c) Copyright IBM Corporation 2016. All Rights Reserved.          
--                                                                   
-- U.S. Government Users Restricted Rights: Use, duplication or      
-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
--                                                                   
-- ***************************************************************** 

ALTER TABLE "CONCORDDB"."DOCEDITORS" ADD COLUMN "LEAVESESSION" TIMESTAMP ;
REORG TABLE "CONCORDDB"."DOCEDITORS" ;

COMMIT WORK;
CONNECT RESET;


--DISCONNECT ALL;
