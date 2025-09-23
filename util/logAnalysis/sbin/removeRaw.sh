#/bin/bash

source logEnv.sh

if [ $# -ne 2 ]; then
    echo "usage: shell site month";
    exit 1;
fi
site=$1;
month=$2;

echo hadoop fs -rm -r $HDFS_HOME/raw/$site/$month;
hadoop fs -rm -r $HDFS_HOME/raw/$site/$month;
