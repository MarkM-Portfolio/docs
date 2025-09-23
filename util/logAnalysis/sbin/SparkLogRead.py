'''

@author: yangyf
'''
import re
import json
import sys
import time
from datetime import datetime
from pyspark import SparkContext, SparkConf
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

def hdfsformal(line):
    return line[1]

def isLog(line):
    match = re.match(ACTION_PATTERN, line)
    return match

def formalize(line):
    match = re.match(ACTION_PATTERN, line)
    if match:
        try:
            a_time = datetime.strptime(match.group(1), DATE_FORMAT) 
        except ValueError:
            print "errors[.]" + match.group(1) + "]"
            a_time = match.group(1)
        uid = match.group(2)
        oid = match.group(3)
        action = match.group(4)
        docid = match.group(5)

        # special cases info filtering
        other_info = match.group(6)
        coedit_num = 0

        if other_info:
            co_match = re.match(".+pCount: (\d)+", other_info)
            if co_match:
                coedit_num = int(co_match.group(1))
        else:
            other_info = "N/A"
        doc_src = None
        doc_tgt = None
        
        if DOWNLOAD_AS == action.upper():
            asformat = re.match(DOWNLOADAS_PATTERN, other_info)
            if asformat:
                doc_tgt = asformat.group(1)
                #print "%s " % (doc_tgt)
        elif CREATE_DOC == action.upper():
            src_type = re.match(CREATEDOC_PATTERN, other_info)
            if src_type:
                doc_src = src_type.group(1)
                #doc_tgt = src_tgt.group(2)
                #print "%s " % (doc_src)
        elif EDIT_DOC == action.upper():
            src_tgt = re.match(EDITDOC_PATTERN, other_info)
            if src_tgt:
                doc_src = src_tgt.group(1)
                #doc_tgt = src_tgt.group(2)
                #print "%s " % (doc_src)
        #print other_info
            
        record = {"atime": a_time, "uid": uid, "oid": oid, "type": action, 
                "docid": docid, "rawlog": line} # "other": other_info
        if doc_src:
            record["doc_src"] = doc_src
        if doc_tgt:
            record["doc_tgt"] = doc_tgt
        #if down_as:
        #    record["downloadas"] = down_as
        if coedit_num: # possible browser and coedit together??
            record["coedit_num"] = coedit_num
            #print "coedit_num: %s" % coedit_num
        return record

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print 'Usage: python input_name output_name'
        exit(1)
    f_in = sys.argv[1]
    f_out = sys.argv[2]
    conf = SparkConf().setAppName("Log Analysis 1")
    sc = SparkContext(conf=conf)

    tStart = time.time()

    lineRDD = sc.newAPIHadoopFile(f_in, 
        'org.apache.hadoop.mapreduce.lib.input.TextInputFormat', 'org.apache.hadoop.io.LongWritable', 'org.apache.hadoop.io.Text',
        conf={'mapreduce.input.fileinputformat.input.dir.recursive':'true'}, batchSize=20)
    rawRecord = lineRDD.map(hdfsformal).filter(isLog).map(formalize)
    #rawRecord.cache()
    val = rawRecord.getNumPartitions()
    print val
    if val > 200:
        rawRecord = rawRecord.coalesce(200)
    rawRecord.saveAsPickleFile(f_out)
    
    tEnd = time.time()
    print "It cost %f sec" % (tEnd - tStart)
