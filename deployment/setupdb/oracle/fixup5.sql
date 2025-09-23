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

--CONNECT TO CONCORD@
ALTER SESSION SET CURRENT_SCHEMA = CONCORDDB;

CREATE TABLE "CONCORDDB"."HKTASK"
(
	"TASKID" NUMBER(38) NOT NULL,
	"VERSION" VARCHAR2(5) NOT NULL,
	"ROW_VERSION" INTEGER NOT NULL,
	"TASKTYPE" INTEGER NOT NULL,
	"TASKSUSPENDED" NUMBER(5) NOT NULL,
	"CANCELLED" NUMBER(5) NOT NULL,
	"NEXTFIRETIME" NUMBER(38) NOT NULL,
	"STARTBYINTERVAL" VARCHAR2(254),
	"STARTBYTIME" NUMBER(38),
	"VALIDFROMTIME" NUMBER(38),
	"VALIDTOTIME" NUMBER(38),
	"REPEATINTERVAL" VARCHAR2(254),
	"MAXREPEATS" INTEGER NOT NULL,
	"REPEATSLEFT" INTEGER NOT NULL,
	"TASKINFO" BLOB,
	"NAME" VARCHAR2(254),
	"AUTOPURGE" INTEGER NOT NULL,
	"FAILUREACTION" INTEGER,
	"MAXATTEMPTS" INTEGER,
	"QOS" INTEGER,
	"PARTITIONID" INTEGER,
	"OWNERTOKEN" VARCHAR2(200) NOT NULL,
	"CREATETIME" NUMBER(38) NOT NULL
)
TABLESPACE "DOCSTS32";


ALTER TABLE "CONCORDDB"."HKTASK" ADD PRIMARY KEY ("TASKID");

CREATE INDEX "CONCORDDB"."HKTASK_IDX1" ON "CONCORDDB"."HKTASK" ("TASKID","OWNERTOKEN");

CREATE INDEX "CONCORDDB"."HKTASK_IDX2" ON "CONCORDDB"."HKTASK" ("NEXTFIRETIME" ASC, "REPEATSLEFT", "PARTITIONID"); -- CLUSTER@

CREATE TABLE "CONCORDDB"."HKTREG"
(
	"REGKEY" VARCHAR(254) NOT NULL,
	"REGVALUE" VARCHAR(254)
)
TABLESPACE "DOCSTS32";

ALTER TABLE "CONCORDDB"."HKTREG" ADD CONSTRAINT "SCHED_TREG_PKEY" PRIMARY KEY ("REGKEY");

CREATE TABLE "CONCORDDB"."HKLMGR"
(
	"LEASENAME" VARCHAR2(254) NOT NULL,
	"LEASEOWNER" VARCHAR2(254) NOT NULL,
	"LEASE_EXPIRE_TIME" NUMBER(38),
	"DISABLED" VARCHAR2(5)
)
TABLESPACE "DOCSTS8";

ALTER TABLE "CONCORDDB"."HKLMGR" ADD CONSTRAINT "SCHED_LMGR_PKEY" PRIMARY KEY ("LEASENAME");

CREATE TABLE "CONCORDDB"."HKLMPR"
(
	"LEASENAME" VARCHAR(254) NOT NULL,
	"NAME" VARCHAR(254) NOT NULL,
	"VALUE" VARCHAR(254) NOT NULL
)
TABLESPACE "DOCSTS8";

ALTER TABLE "CONCORDDB"."HKLMPR" ADD CONSTRAINT "SCHED_LMPR_PKEY" PRIMARY KEY ("LEASENAME", "NAME");


COMMIT;

QUIT;
