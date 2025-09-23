#!/bin/bash

curdir=`dirname $0`

cd $curdir

cd ../../

sshurl=$1@$2

zip -rq com.ibm.docs.web.resources.zip ./com.ibm.docs.web.resources/*

echo -e scp ./com.ibm.docs.web.resources.zip $sshurl:/home/$1/ > ./com.ibm.docs.web.resources/teststools/run_ut.log
scp ./com.ibm.docs.web.resources.zip $sshurl:/home/$1/ 2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

rm -rf com.ibm.docs.web.resources.zip

echo -e ssh $sshurl unzip -oq com.ibm.docs.web.resources.zip >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh $sshurl unzip -oq com.ibm.docs.web.resources.zip 2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

echo -e ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_spreadsheet_ut.sh >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_spreadsheet_ut.sh 2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

#clean previous hanged ut run, just in case.
ssh $sshurl pkill -f jscover
ssh $sshurl pkill -f phantomjs

echo -e Start run spreadsheet Unit Test
echo -e ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_spreadsheet_ut.sh &" >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_spreadsheet_ut.sh &" #2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

pid=$(ps aux | grep "gen_jscover_spreadsheet_ut.sh" | awk '{print $2}' | sort -n | head -n 1)

echo -e "ssh command is running, pid:${pid}"

sleep 10 && kill ${pid}
echo -e "Docs Spreadsheet ut triggered"

#wait for a while to ensure the UT complete before copy logs
sleep 60

echo -e scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-spreadsheet >> ./com.ibm.docs.web.resources/teststools/run_ut.log
scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-spreadsheet  2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

ssh $sshurl rm -rf com.ibm.docs.web.resources/teststools/jscover-report

echo -e Start run presentation Unit Test
echo -e ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_presentation_ut.sh >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_presentation_ut.sh 2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

#clean previous hanged ut run, just in case, prepare for presentation UT run.
ssh $sshurl pkill -f jscover
ssh $sshurl pkill -f phantomjs

echo -e ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_presentation_ut.sh &" >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_presentation_ut.sh &" #2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

pid=$(ps aux | grep "gen_jscover_presentation_ut.sh" | awk '{print $2}' | sort -n | head -n 1)

echo -e "ssh command is running, pid:${pid}"

sleep 10 && kill ${pid}
echo -e "Docs Presentation ut triggered"

echo -e wait for a while to ensure the UT complete before copy logs
sleep 60

echo -e scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-presentation >> ./com.ibm.docs.web.resources/teststools/run_ut.log
scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-presentation  2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

echo -e Start run Document Unit Test
echo -e ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_writer_ut.sh >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_writer_ut.sh 2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

#clean previous hanged ut run, just in case, prepare for Document UT run.
ssh $sshurl pkill -f jscover
ssh $sshurl pkill -f phantomjs

echo -e ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_writer_ut.sh &" >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_writer_ut.sh &" #2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

pid=$(ps aux | grep "gen_jscover_writer_ut.sh" | awk '{print $2}' | sort -n | head -n 1)

echo -e "ssh command is running, pid:${pid}"

sleep 10 && kill ${pid} 
echo -e "Docs Document ut triggered"

#wait for a while to ensure the UT complete before copy logs
sleep 60

echo -e scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-document >> ./com.ibm.docs.web.resources/teststools/run_ut.log
scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-document  2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

echo -e Start run Common Service Unit Test
echo -e ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_common_ut.sh >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh $sshurl chmod a+x ./com.ibm.docs.web.resources/teststools/gen_jscover_common_ut.sh 2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

#clean previous hanged ut run, just in case, prepare for Common Service UT run.
ssh $sshurl pkill -f jscover
ssh $sshurl pkill -f phantomjs

echo -e ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_common_ut.sh &" >> ./com.ibm.docs.web.resources/teststools/run_ut.log
ssh -f -n $sshurl "cd ./com.ibm.docs.web.resources/teststools; ./gen_jscover_common_ut.sh &" #2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log

pid=$(ps aux | grep "gen_jscover_common_ut.sh" | awk '{print $2}' | sort -n | head -n 1)

echo -e "ssh command is running, pid:${pid}"

sleep 10 && kill ${pid} 
echo -e "Common Service ut triggered"

#wait for a while to ensure the UT complete before copy logs
sleep 60

echo -e scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-common >> ./com.ibm.docs.web.resources/teststools/run_ut.log
scp -rpq $sshurl:/home/$1/com.ibm.docs.web.resources/teststools/jscover-report ./com.ibm.docs.web.resources/teststools/jscover-report-common 2>&1 | tee -a ./com.ibm.docs.web.resources/teststools/run_ut.log


ssh $sshurl rm -rf com.ibm.docs.web.resources com.ibm.docs.web.resources.zip

teststools="com.ibm.docs.web.resources/teststools"

java -cp ./$teststools/utils/JSCover-all.jar jscover.report.Main --merge ./$teststools/jscover-report-presentation ./$teststools/jscover-report-spreadsheet ./$teststools/jscover-report-document ./$teststools/jscover-report-common ./$teststools/jscover-report

#java -cp ./$teststools/utils/JSCover-all.jar jscover.report.Main --format=LCOV ./$teststools/jscover-report C:\Users\imagetest\workspace\ConcordProjectsWAS\com.ibm.docs.web.resources\WebContent\js

if grep -q "UNIT TEST PASSED" ./com.ibm.docs.web.resources/teststools/jscover-report/test_run.log; then echo PASSED; exit 0 ; else echo FAILED; exit 1; fi
