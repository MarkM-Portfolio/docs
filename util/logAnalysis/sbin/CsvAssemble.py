'''

@author: yangyf
'''

import csv
import sys
import datetime
from dateutil.relativedelta import relativedelta

MONTH_FORMAT = '%y/%m'

def getSCValFrom(f_path, month):
    ret = { "edit" : 0, "create" : 0, "coedit" : 0, "mobile" : 0, "sofar" : 0, "activeUser" : 0 }
    
    editFile = file(f_path+"/EDIT.csv","rb")
    reader = csv.reader(editFile)
    for line in reader:
        if line[0] == month:
            ret["edit"] += int(line[1])
    editFile.close()
    
    createFile = file(f_path+"/CREATE.csv","rb")
    reader = csv.reader(createFile)
    for line in reader:
        if line[0] == month:
            ret["create"] += int(line[1])
    createFile.close()
    
    coeditFile = file(f_path+"/CoEDIT.csv","rb")
    reader = csv.reader(coeditFile)
    for line in reader:
        if line[0] == month:
            ret["coedit"] += int(line[1])
    coeditFile.close()
    
    mobileFile = file(f_path+"/MOBILE.csv","rb")
    reader = csv.reader(mobileFile)
    for line in reader:
        if line[0] == month:
            ret["mobile"] += int(line[1])
    mobileFile.close()
    
    sofarFile = file(f_path+"/Sofar.csv","rb")
    reader = csv.reader(sofarFile)
    for line in reader:
        if line[0] == month:
            ret["sofar"] += int(line[1])
    sofarFile.close()
    
    mauFile = file(f_path+"/MAUORG.csv","rb")
    reader = csv.reader(mauFile)
    for line in reader:
        if line[0] == month:
            ret["activeUser"] += int(line[2])
    mauFile.close()
    
    return ret

def GenSCCSV(csv_path):
    start = datetime.datetime.combine(datetime.date(2012, 12, 1), datetime.time(0,0,0))
    today = datetime.datetime.now()
    end = datetime.datetime.combine(datetime.date(today.year, today.month, 1), datetime.time(0,0,0))
    
    headers = ["items"]
    rows = [{ "items" : "A3/E3 Acitive Docs user" }, { "items" : "J3 Active Docs user" }, { "items" : "G3 Acitive Docs user" },
            { "items" : "A3/E3 EDIT entries" }, { "items" : "J3 EDIT entries" }, { "items" : "G3 EDIT entries" },
            { "items" : "A3/E3 CREATE entries" }, { "items" : "J3 CREATE entries" }, { "items" : "G3 CREATE entries" },
            { "items" : "A3/E3 COEDIT entries" }, { "items" : "J3 COEDIT entries" }, { "items" : "G3 COEDIT entries" },
            { "items" : "A3/E3 Mobile/iPad active users" }, { "items" : "J3 Mobile/iPad active users" }, { "items" : "G3 Mobile/iPad active users" },
            { "items" : "A3/E3 Acitive Docs user from deployment until present" }, { "items" : "J3 Acitive Docs user from deployment until present" }, { "items" : "G3 Acitive Docs user from deployment until present" } ]
    
    while start < end:
        month = start.strftime('%y%m')
        monthstr = month[:2] + "/" + month[2:] #"16/07"
        a3val = getSCValFrom(csv_path + "/a3/latest", monthstr)
        g3val = getSCValFrom(csv_path + "/g3/latest", monthstr)
        j3val = getSCValFrom(csv_path + "/j3/latest", monthstr)        
        headers.append(month)
        rows[0][month] = str(a3val["activeUser"]);
        rows[1][month] = str(j3val["activeUser"]);
        rows[2][month] = str(g3val["activeUser"]);

        rows[3][month] = str(a3val["edit"]);
        rows[4][month] = str(j3val["edit"]);
        rows[5][month] = str(g3val["edit"]);
        
        rows[6][month] = str(a3val["create"]);
        rows[7][month] = str(j3val["create"]);
        rows[8][month] = str(g3val["create"]);
        
        rows[9][month] = str(a3val["coedit"]);
        rows[10][month] = str(j3val["coedit"]);
        rows[11][month] = str(g3val["coedit"]);
        
        rows[12][month] = str(a3val["mobile"]);
        rows[13][month] = str(j3val["mobile"]);
        rows[14][month] = str(g3val["mobile"]);
        
        rows[15][month] = str(a3val["sofar"]);
        rows[16][month] = str(j3val["sofar"]);
        rows[17][month] = str(g3val["sofar"]);
        start += relativedelta(months=1)
    
    csvfile = file(csv_path + '/SmartCloudDocsUsage.csv', 'wb')
    dict_writer  = csv.DictWriter(csvfile, fieldnames = headers)
    dict_writer.writeheader()
    dict_writer.writerows(rows)
    csvfile.close()

IBMOID = set(['126'])
IBMTESTOID = set(['20582038','20582554','20585885','20705527','20713237','20715329','20733339','20745866','20748555','20804984','20892309','21066426','21111839','21153787','21171411','21191149','21405246','21409292','21434231','21485471','21487473','21501943','21510306','21336287','20581869','21008589','20100090','21473712','20398290','20817024','21701796','20592958','21544100','20580343','34793','21612797','21657727','20526458','20423328','20550616','20554656','34732','21428396'])

def getOrgValFrom(f_path, month):
    ret = { "mauAll" : 0, "mauIBM" : 0, "mauIBMT" : 0, "mauOth" : 0, "incAll" : 0, "incIBM" : 0, "incIBMT" : 0, "incOth" : 0}
    
    mauFile = file(f_path+"/MAUORG.csv","rb")
    reader = csv.reader(mauFile)
    for line in reader:
        curmon = line[0]
        curoid = line[1]
        cnt = line[2]
        if curmon == month:
            ret["mauAll"] += int(cnt)
            if curoid in IBMOID:
                ret["mauIBM"] += int(cnt)
            elif curoid in IBMTESTOID:
                ret["mauIBMT"] += int(cnt)
            else:
                ret["mauOth"] += int(cnt)
    mauFile.close()
    
    increFile = file(f_path+"/IncreUniqueUser.csv","rb")
    reader = csv.reader(increFile)
    for line in reader:
        curmon = line[0]
        curoid = line[1]
        cnt = line[2]
        if curmon == month:
            ret["incAll"] += int(cnt)
            if curoid in IBMOID:
                ret["incIBM"] += int(cnt)
            elif curoid in IBMTESTOID:
                ret["incIBMT"] += int(cnt)
            else:
                ret["incOth"] += int(cnt)
    increFile.close()
    
    return ret

def GenOrgCSV(csv_path):
    start = datetime.datetime.combine(datetime.date(2012, 12, 1), datetime.time(0,0,0))
    today = datetime.datetime.now()
    end = datetime.datetime.combine(datetime.date(today.year, today.month, 1), datetime.time(0,0,0))
    
    headers = ["items"]
    rows = [{ "items" : "A3/E3 Acitive Docs user" }, { "items" : "A3/E3 IBM(oid=126) Active user" }, { "items" : "A3/E3 IBM Test active user" }, { "items" : "A3/E3 Customer user(NO IBM&Test)" },
            { "items" : "All A3/E3 incremental unique users" }, { "items" : "A3/E3 IBM(oid126) unique users" }, { "items" : "A3/E3 IBM Test unique users" }, { "items" : "A3/E3 Customer user(NO IBM&Test)" }]
    
    while start < end:
        month = start.strftime('%y%m')
        monthstr = month[:2] + "/" + month[2:] #"16/07"
        a3val = getOrgValFrom(csv_path + "/a3/latest", monthstr)
        
        headers.append(month)
        rows[0][month] = str(a3val["mauAll"])
        rows[1][month] = str(a3val["mauIBM"])
        rows[2][month] = str(a3val["mauIBMT"])
        rows[3][month] = str(a3val["mauOth"])
        
        rows[4][month] = str(a3val["incAll"])
        rows[5][month] = str(a3val["incIBM"])
        rows[6][month] = str(a3val["incIBMT"])
        rows[7][month] = str(a3val["incOth"])
        
        start += relativedelta(months=1)
    
    csvfile = file(csv_path + '/A3 unique and MAU users.csv', 'wb')
    dict_writer  = csv.DictWriter(csvfile, fieldnames = headers)
    dict_writer.writeheader()
    dict_writer.writerows(rows)
    csvfile.close()


if __name__ == '__main__':
    
    if len(sys.argv) < 2:
        print 'Usage: python csv_path'
        exit(1)
    csv_path = sys.argv[1]
    
    #csv_path = "C:/Users/IBM_ADMIN/Desktop/csv"
    
    GenSCCSV(csv_path)
    GenOrgCSV(csv_path)
