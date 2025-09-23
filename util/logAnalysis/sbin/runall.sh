#/bin/bash

source logEnv.sh

if [ $# -ne 1 ]; then
    echo "usage: shell site";
    exit 1;
fi
site=$1;

echo spark-submit --master $SPARK_HOST SparkLogStasis.py $HDFS_HOME/pick/$site/* $HDFS_HOME/sofar/$site
     spark-submit --master $SPARK_HOST SparkLogStasis.py $HDFS_HOME/pick/$site/* $HDFS_HOME/sofar/$site

echo hadoop fs -rm -r $HDFS_HOME/sofar/$site
     hadoop fs -rm -r $HDFS_HOME/sofar/$site

echo hadoop fs -mv $HDFS_HOME/sofar/$site-new $HDFS_HOME/sofar/$site
     hadoop fs -mv $HDFS_HOME/sofar/$site-new $HDFS_HOME/sofar/$site

echo spark-submit --master $SPARK_HOST UniqueUserORG.py $HDFS_HOME/sofar/$site
     spark-submit --master $SPARK_HOST UniqueUserORG.py $HDFS_HOME/sofar/$site

mkdir $DATA_HOME/csv
mkdir $DATA_HOME/csv/$site
mkdir $DATA_HOME/csv/$site/latest
mv $BIN_HOME/*.csv $DATA_HOME/csv/$site/latest
