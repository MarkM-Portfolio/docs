#/bin/bash

source logEnv.sh

if [ $# -ne 2 ]; then
    echo "usage: shell site month";
    exit 1;
fi
site=$1;
month=$2;

echo $BIN_HOME/upload.sh $site $month
time $BIN_HOME/upload.sh $site $month | tee -a $SPARKLOG_HOME/upload.log
echo $BIN_HOME/runspark.sh $site $month
time $BIN_HOME/runspark.sh $site $month | tee -a $SPARKLOG_HOME/spark.log
