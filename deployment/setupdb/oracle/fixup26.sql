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

--CONNECT TO CONCORD@
GRANT INSERT,UPDATE,SELECT,DELETE ON "CONCORDDB"."DOC_ENTITLEMENT" TO DOCSUSER_ROLE;
GRANT INSERT,UPDATE,SELECT,DELETE ON "CONCORDDB"."ORG_ENTITLEMENT" TO DOCSUSER_ROLE;
GRANT INSERT,UPDATE,SELECT,DELETE ON "CONCORDDB"."USER_ENTITLEMENT" TO DOCSUSER_ROLE;
GRANT INSERT,UPDATE,SELECT,DELETE ON "CONCORDDB"."CUSTOMER_CREDENTIAL" TO DOCSUSER_ROLE;
		
COMMIT;
QUIT;