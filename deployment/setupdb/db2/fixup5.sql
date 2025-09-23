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

------------------------------------------------------------------------------------------
-- Create House Keeping Scheduler Tables and Indexes --
-- Assuming that the "Table Prefix" defined in WAS admin console must be "CONCORDDB.HK". --
------------------------------------------------------------------------------------------

CONNECT TO CONCORD@

CREATE TABLE "CONCORDDB"."HKTASK" ("TASKID" BIGINT NOT NULL ,
              "VERSION" VARCHAR(5) NOT NULL ,
              "ROW_VERSION" INTEGER NOT NULL ,
              "TASKTYPE" INTEGER NOT NULL ,
              "TASKSUSPENDED" SMALLINT NOT NULL ,
              "CANCELLED" SMALLINT NOT NULL ,
              "NEXTFIRETIME" BIGINT NOT NULL ,
              "STARTBYINTERVAL" VARCHAR(254) ,
              "STARTBYTIME" BIGINT ,
              "VALIDFROMTIME" BIGINT ,
              "VALIDTOTIME" BIGINT ,
              "REPEATINTERVAL" VARCHAR(254) ,
              "MAXREPEATS" INTEGER NOT NULL ,
              "REPEATSLEFT" INTEGER NOT NULL ,
              "TASKINFO" BLOB(102400) LOGGED NOT COMPACT ,
              "NAME" VARCHAR(254) NOT NULL ,
              "AUTOPURGE" INTEGER NOT NULL ,
              "FAILUREACTION" INTEGER ,
              "MAXATTEMPTS" INTEGER ,
              "QOS" INTEGER ,
              "PARTITIONID" INTEGER ,
              "OWNERTOKEN" VARCHAR(200) NOT NULL ,
              "CREATETIME" BIGINT NOT NULL )  IN "CONCORDNAMESPACE" @

ALTER TABLE "CONCORDDB"."HKTASK" ADD PRIMARY KEY ("TASKID")@

CREATE INDEX "CONCORDDB"."HKTASK_IDX1" ON "CONCORDDB"."HKTASK" ("TASKID",
              "OWNERTOKEN") @

CREATE INDEX "CONCORDDB"."HKTASK_IDX2" ON "CONCORDDB"."HKTASK" ("NEXTFIRETIME" ASC,
               "REPEATSLEFT",
               "PARTITIONID") CLUSTER@

CREATE TABLE "CONCORDDB"."HKTREG" ("REGKEY" VARCHAR(254) NOT NULL ,
              "REGVALUE" VARCHAR(254) ) IN "CONCORDNAMESPACE" @

ALTER TABLE "CONCORDDB"."HKTREG" ADD PRIMARY KEY ("REGKEY")@

CREATE TABLE "CONCORDDB"."HKLMGR" (LEASENAME VARCHAR(254) NOT NULL,
               LEASEOWNER VARCHAR(254) NOT NULL,
               LEASE_EXPIRE_TIME  BIGINT,
              DISABLED VARCHAR(5))IN "CONCORDNAMESPACE" @

ALTER TABLE "CONCORDDB"."HKLMGR" ADD PRIMARY KEY ("LEASENAME")@

CREATE TABLE "CONCORDDB"."HKLMPR" (LEASENAME VARCHAR(254) NOT NULL,
              NAME VARCHAR(254) NOT NULL,
              VALUE VARCHAR(254) NOT NULL)IN "CONCORDNAMESPACE" @

CREATE INDEX "CONCORDDB"."HKLMPR_IDX1" ON "CONCORDDB"."HKLMPR" (LEASENAME,
               NAME)@

COMMIT WORK@
CONNECT RESET@
