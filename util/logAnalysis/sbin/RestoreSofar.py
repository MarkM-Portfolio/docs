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

def distinctUid(a, b):
    a |= b
    return a
# mon need to be a datetime
def GetSofarWithBak(f_sofar_bak, f_sofar, rawRecord):
    def uidAtimeOid(record):
        return (record["uid"], (record["atime"], record["oid"]))
    def uniqueUid(ra, rb):
        return (min(ra[0], rb[0]), ra[1])
    print "SOFAR( users )"
    sofarBak = sc.pickleFile(f_sofar_bak, 20)
    newBak = rawRecord.map(uidAtimeOid).union(sofarBak).reduceByKey(uniqueUid).coalesce(200)
    newBak.saveAsPickleFile(f_sofar)
    
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


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print 'Usage: python pick_path_file sofar_path sofar_bak_path'
        exit(1)
    f_in = sys.argv[1]
    f_sofar = sys.argv[2]
    f_sofar_bak = sys.argv[3]
    
    conf = SparkConf().setAppName("restore sofar")
    sc = SparkContext(conf=conf)
    
    tStart = time.time()
    files = open(f_in)
    tmp = None
    for file in files.readlines():
        file=file.strip('\n')
        rawRecord = sc.pickleFile(file, 20).filter(lambda record: isinstance (record["atime"], datetime.datetime))
        if tmp:
            rawRecord = rawRecord.union(tmp)
        tmp = rawRecord
    print rawRecord.getNumPartitions()
    
    GetSofarWithBak(f_sofar_bak, f_sofar, rawRecord)
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
    
