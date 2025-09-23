#/bin/bash

source logEnv.sh

spark-submit --master $SPARK_HOST $BIN_HOME/RestoreSofar.py $DATA_HOME/g3.txt $HDFS_HOME/sofar/g3-new $HDFS_HOME/sofar/tmp
mv Sofar.csv $DATA_HOME/Sofar.csv.g3
spark-submit --master $SPARK_HOST $BIN_HOME/RestoreSofar.py $DATA_HOME/j3.txt $HDFS_HOME/sofar/j3-new $HDFS_HOME/sofar/tmp
mv Sofar.csv $DATA_HOME/Sofar.csv.j3
spark-submit --master $SPARK_HOST $BIN_HOME/RestoreSofar.py $DATA_HOME/a3.txt $HDFS_HOME/sofar/a3-new $HDFS_HOME/sofar/tmp
mv Sofar.csv $DATA_HOME/Sofar.csv.a3
