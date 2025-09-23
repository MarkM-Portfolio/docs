#!/bin/bash

curdir=`dirname $0`

cd $curdir

cd ../../../../../

sshurl=$1@$2

zip -rq com.ibm.docs.web.resources.zip ./com.ibm.docs.web.resources/*

echo scp ./com.ibm.docs.web.resources.zip $sshurl:/home/$1/ > ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log
scp ./com.ibm.docs.web.resources.zip $sshurl:/home/$1/ 2>&1 | tee -a ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log

rm -rf com.ibm.docs.web.resources.zip

echo ssh $sshurl unzip -oq com.ibm.docs.web.resources.zip >> ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log
ssh $sshurl unzip -oq com.ibm.docs.web.resources.zip 2>&1 | tee -a ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log

echo ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_spreadsheet_ut.sh >> ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log
ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_spreadsheet_ut.sh 2>&1 | tee -a ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log

#clean previous hanged ut run, just in case.
ssh $sshurl pkill -f jscover
ssh $sshurl pkill -f phantomjs

echo ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_spreadsheet_ut.sh &" >> ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log
ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_spreadsheet_ut.sh &" #2>&1 | tee -a ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log

pid=$(ps aux | grep "gen_jscover_spreadsheet_ut.sh" | awk '{print $2}' | sort -n | head -n 1)

echo "ssh command is running, pid:${pid}"

sleep 10 && kill ${pid} && echo "Docs ut triggered"

#wait for a while to ensure the UT complete before copy logs
sleep 90

echo scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/ >> ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log
scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/  2>&1 | tee -a ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/run_ut.log

ssh $sshurl rm -rf com.ibm.docs.web.resources com.ibm.docs.web.resources.zip

if grep -q "UNIT TEST PASSED" ./com.ibm.docs.web.resources/WebContent/js/wseditor/test/jscover-report/test_run.log; then echo PASSED; exit 0 ; else echo FAILED; exit 1; fi

	
	