-- ***************************************************************** 
--                                                                   
-- Licensed Materials - Property of IBM                              
--                                                                   
-- 5724-S31                                                          
--                                                                   
-- Copyright IBM Corp. 2009, 2013  All Rights Reserved.              
--                                                                   
-- US Government Users Restricted Rights - Use, duplication or       
-- disclosure restricted by GSA ADP Schedule Contract with           
-- IBM Corp.                                                         
--                                                                   
-- *****************************************************************  


DROP USER CONCORDDB CASCADE;
DROP USER DOCSUSER CASCADE;
DROP TABLESPACE DOCSTS8 INCLUDING CONTENTS AND DATAFILES CASCADE CONSTRAINTS;
DROP TABLESPACE DOCSTS32 INCLUDING CONTENTS AND DATAFILES CASCADE CONSTRAINTS;
DROP ROLE DOCSUSER_ROLE;

COMMIT;
		

QUIT;
