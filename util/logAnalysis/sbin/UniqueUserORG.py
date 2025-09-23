'''

@author: yangyf
'''
import re
import json
import csv
import time
import sys
import datetime
from operator import add
from dateutil.relativedelta import relativedelta
from pyspark import SparkContext, SparkConf, StorageLevel
from operator import add

CREATE_DOC = "CREATEDOC"
EDIT_DOC = "EDITDOC"
CONVERT_DOC = "CONVERTDOC"
DOWNLOAD_AS = "DOWNLOADAS"
IBM_DOCS="ibmdocs"
ACTION_PATTERN = "\s*\[(.+) GMT\].+ Action on IBM Docs: The user (\d+) belonging to organization (\d+) executed ([^\s]+) operation on document ([^\s]+)( .+)?"
DATE_FORMAT = '%m/%d/%y %H:%M:%S:%f'
MONTH_FORMAT = '%y/%m'
START_DATE = "12/01/2012"
END_DATE = "11/01/2014"

SRC_TGT_PATTERN = "[^\{]*\{sourceType:\s*([^\,]+),\s*targetType:([^\}]+)\}"
DOWNLOADAS_PATTERN = "[^\{]*\{asFormat:\s*([^\}]+)\}"
CREATEDOC_PATTERN = "[^\{]*\{mimeType:\s*([^\,]+),\s*fileSize:([^\}]+)\}"
EDITDOC_PATTERN = "[^\{]*\{mimeType:\s*([^\,]+),\s*fileSize:([^\}]+)\}"

def uidAtimePerMonthSet(record):
    key = record["atime"].strftime(MONTH_FORMAT)
    ret = set()
    ret.add((record["uid"], record["atime"]))
    return (key, ret)

def uidPerMonthSet(record):
    key = record["atime"].strftime(MONTH_FORMAT)
    ret = set()
    ret.add(record["uid"])
    return (key,ret)

def distinctUid(a, b):
    a |= b
    return a
    
def getCnt(kv):
    return (kv[0],len(kv[1]))

def GetUserPerOrg(sofarRecord):
    def uidPerOidPerMonthSofarSet(record):
        ret = []
        start = record[1][0]
        oid = record[1][1]
        uid = record[0]
        today = datetime.datetime.now()
        end = datetime.datetime.combine(datetime.date(today.year, today.month, 1), datetime.time(0,0,0))
        #end = datetime.now() + relativedelta(months=1)
        while start < end:
            mon = start.strftime(MONTH_FORMAT)
            key = {"mon":mon, "oid":oid}
            kStr = json.dumps(key)
            ret.append((kStr, 1))
            start += relativedelta(months=1)
        return ret
    
    print "users data per organization( users )"
    val = sofarRecord.flatMap(uidPerOidPerMonthSofarSet).reduceByKey(add).collect()
    tmp = []
    for ele in val:
        key = json.loads(ele[0]);
        key['cnt'] = ele[1]
        tmp.append(key)
    ret = {}
    for cur in tmp:
        cmon = cur['mon']
        if cmon in ret:
            ret[cmon].append(cur)
        else:
            ret[cmon] = []
            ret[cmon].append(cur)
    headers = ['mon','oid','cnt']
    rows = []
    for cmon in ret:
        ret[cmon].sort(cmp=lambda x,y:cmp(x['cnt'],y['cnt']), reverse=True)
        print "========== %s ==============================" % (cmon)
        for e in ret[cmon]:
            print "%s : %s" % (e["oid"], e['cnt'])
            tmp = []
            tmp.append(e["mon"])
            tmp.append(e["oid"])
            tmp.append(e["cnt"])
            rows.append(tmp)
    rows.sort(cmp=lambda x,y:cmp(x[0],y[0]))
    with open('IncreUniqueUser.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        for row in rows:
            f_csv.writerow(row)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print 'Usage: python sofar_path'
        exit(1)
    f_sofar = sys.argv[1]
    
    conf = SparkConf().setAppName("IncreUniqueUser")
    sc = SparkContext(conf=conf)
    
    tStart = time.time()
    
    rawRecord = sc.pickleFile(f_sofar, 20)
    rawRecord.persist(storageLevel=StorageLevel(True, True, False, False, 1))
    print rawRecord.getNumPartitions()
    
    GetUserPerOrg(rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
