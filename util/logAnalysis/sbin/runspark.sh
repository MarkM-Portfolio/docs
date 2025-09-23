#/bin/bash

source logEnv.sh

if [ $# -ne 2 ]; then
    echo "usage: shell site month";
    exit 1;
fi
site=$1;
month=$2;

echo time spark-submit --master $SPARK_HOST $BIN_HOME/SparkLogRead.py $HDFS_HOME/raw/$site/$month $HDFS_HOME/pick/$site/$month
     time spark-submit --master $SPARK_HOST $BIN_HOME/SparkLogRead.py $HDFS_HOME/raw/$site/$month $HDFS_HOME/pick/$site/$month

#hadoop fs -rmr $HDFS_HOME/raw/$site/$month

echo time spark-submit --master $SPARK_HOST $BIN_HOME/SparkLogStasis.py $HDFS_HOME/pick/$site/$month $HDFS_HOME/sofar/$site
     time spark-submit --master $SPARK_HOST $BIN_HOME/SparkLogStasis.py $HDFS_HOME/pick/$site/$month $HDFS_HOME/sofar/$site

#update sofar
hadoop fs -rmr $HDFS_HOME/sofar/$site
hadoop fs -mv $HDFS_HOME/sofar/$site-new $HDFS_HOME/sofar/$site

#csv related

mkdir $DATA_HOME/csv
mkdir $DATA_HOME/csv/$site
mkdir $DATA_HOME/csv/$site/$month
mv $BIN_HOME/*.csv $DATA_HOME/csv/$site/$month
