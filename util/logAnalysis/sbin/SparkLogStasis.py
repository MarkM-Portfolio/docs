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

#def uidPerMonth(record):
#    key = record["atime"].strftime(MONTH_FORMAT)
#    return (key, record["uid"])
#
#def uidAtimePerMonth(record):
#    key = record["atime"].strftime(MONTH_FORMAT)
#    return (key, record["uid"], record["atime"])

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

def GetMAU(rawRecord):
    print "MAU( users )"
    rows = sorted(rawRecord.map(uidPerMonthSet).reduceByKey(distinctUid).map(getCnt).collect())
    print rows
    headers = ['date','count']
    with open('MAU.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        f_csv.writerows(rows)
# mon need to be a datetime
def GetSofarWithBak(sc, f_sofar, rawRecord):
    sofarBak = sc.pickleFile(f_sofar, 20)
    def uidAtimeOid(record):
        return (record["uid"], (record["atime"], record["oid"]))
    def uniqueUid(ra, rb):
        return (min(ra[0], rb[0]), ra[1])
    #def uidSofar(record):
    #    return (record["uid"], record["atime"])
    print "SOFAR( users )"
    newBak = rawRecord.map(uidAtimeOid).union(sofarBak).reduceByKey(uniqueUid)
    newBak.coalesce(200).saveAsPickleFile(f_sofar+"-new")
    
    def uidSofar(record):
        ret = []
        start = record[1][0]
        today = datetime.datetime.now()
        end = datetime.datetime.combine(datetime.date(today.year, today.month, 1), datetime.time(0,0,0))
        #end = datetime.now() + relativedelta(months=1)
        while start < end:
            key = start.strftime(MONTH_FORMAT)
            ret.append((key, 1))
            start += relativedelta(months=1)
        return ret
    rows = sorted(newBak.flatMap(uidSofar).reduceByKey(add).collect())
    print rows
    headers = ['date','count']
    with open('Sofar.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        f_csv.writerows(rows)

def GetSofar(rawRecord):
    def uidSofar(record):
        ret = []
        start = record["atime"]
        today = datetime.datetime.now()
        end = datetime.datetime.combine(datetime.date(today.year, today.month, 1), datetime.time(0,0,0))
        #end = datetime.now() + relativedelta(months=1)
        while start < end:
            key = start.strftime(MONTH_FORMAT)
            ret.append((key, record["uid"]))
            start += relativedelta(months=1)
        return ret
    def sofarSet(kv):
        ret = set()
        ret.add(kv[1])
        return (kv[0],ret)
    print "SOFAR( users )"
    rows = sorted(rawRecord.flatMap(uidSofar).map(sofarSet).reduceByKey(distinctUid).map(getCnt).collect())
    print rows
    headers = ['date','count']
    with open('Sofar.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        f_csv.writerows(rows)

def GetEDIT(rawRecord):
    def isEdit(record):
        return record["type"]=="EDITDOC"

    print "get EDIT( actions )"
    rows = sorted(rawRecord.filter(isEdit).map(uidAtimePerMonthSet).reduceByKey(distinctUid).map(getCnt).collect())
    print rows
    headers = ['date','count']
    with open('EDIT.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        f_csv.writerows(rows)

def GetCREATE(rawRecord):
    def isCreate(record):
        return record["type"]=="CREATEDOC"

    print "getCREATE( actions )"
    rows = sorted(rawRecord.filter(isCreate).map(uidAtimePerMonthSet).reduceByKey(distinctUid).map(getCnt).collect())
    print rows
    headers = ['date','count']
    with open('CREATE.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        f_csv.writerows(rows)

def GetCoEDIT(rawRecord):
    def isCoEdit(record):
        if "coedit_num" in record:
            return record["coedit_num"]>=2
        else:
            return False

    print "getCoEDIT( actions )"
    rows = sorted(rawRecord.filter(isCoEdit).map(uidAtimePerMonthSet).reduceByKey(distinctUid).map(getCnt).collect())
    print rows
    headers = ['date','count']
    with open('CoEDIT.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        f_csv.writerows(rows)

def GetMobile(rawRecord):
    def isMobile(record):
        return record["rawlog"].find("iPad") >= 0 or record["rawlog"].find("Mobile") >= 0

    print "getMobile( users )"
    rows = sorted(rawRecord.filter(isMobile).map(uidPerMonthSet).reduceByKey(distinctUid).map(getCnt).collect())
    print rows
    headers = ['date','count']
    with open('MOBILE.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        f_csv.writerows(rows)

def GetUserPerOrg(rawRecord):
    def uidPerOidPerMonthSet(record):
        mon = record["atime"].strftime(MONTH_FORMAT)
        oid = record["oid"]
        key = {"mon":mon, "oid":oid}
        kStr = json.dumps(key)
        ret = set()
        ret.add(record['uid'])
        return (kStr, ret)
    
    print "users data per organization( users )"
    val = rawRecord.map(uidPerOidPerMonthSet).reduceByKey(distinctUid).map(getCnt).collect()
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
    with open('MAUORG.csv','w') as f:
        f_csv = csv.writer(f)
        f_csv.writerow(headers)
        for row in rows:
            f_csv.writerow(row)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print 'Usage: python input_name sofar_path'
        exit(1)
    f_in = sys.argv[1]
    f_sofar = sys.argv[2]
    
    conf = SparkConf().setAppName("Log Analysis 2")
    sc = SparkContext(conf=conf)
    
    tStart = time.time()
    
    rawRecord = sc.pickleFile(f_in, 20).filter(lambda record: isinstance (record["atime"], datetime.datetime))
    rawRecord.persist(storageLevel=StorageLevel(True, True, False, False, 1))
    print rawRecord.getNumPartitions()
    
    #GetMAU(rawRecord)
    #tEnd = time.time()
    #print "It cost %f sec" % (tEnd - tStart)
    #
    #GetSofar(rawRecord)
    #tEnd = time.time()
    #print "It cost %f sec" % (tEnd - tStart)
    
    
    GetUserPerOrg(rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
    GetSofarWithBak(sc, f_sofar, rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
    GetEDIT(rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
    GetCREATE(rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
    GetCoEDIT(rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
    GetMobile(rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
