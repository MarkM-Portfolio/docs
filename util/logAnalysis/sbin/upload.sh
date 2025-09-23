#/bin/bash

source logEnv.sh

if [ $# -ne 2 ]; then
    echo "usage: shell site month";
    exit 1;
fi
site=$1;
month=$2;
#parallel control
tempfifo=$$.fifo

trap "exec 1000>&-;exec 1000<&-;exit 0" 2
mkfifo $tempfifo
exec 1000<>$tempfifo
rm -rf $tempfifo
for ((i=1; i<=1; i++));
do
    echo >&1000
done

hadoop fs -mkdir $HDFS_HOME/raw;
hadoop fs -mkdir $HDFS_HOME/pick;
hadoop fs -mkdir $HDFS_HOME/sofar;
hadoop fs -mkdir $HDFS_HOME/raw/$site;
hadoop fs -mkdir $HDFS_HOME/sofar/$site;
hadoop fs -mkdir $HDFS_HOME/raw/$site/$month;
mkdir $TMPFS_HOME/docs
#select all files with a name of SystemOut
for tarpath in $DATA_HOME/$month/$site/*.tgz;
do
    read -u1000
    {
        tar=`basename $tarpath`
        mkdir $TMPFS_HOME/docs/$tar;
        echo tar -C $TMPFS_HOME/docs/$tar -xzvf $tarpath *SystemOut*;
        tar -C $TMPFS_HOME/docs/$tar -xzvf $tarpath *SystemOut*;
        chmod +x -R $TMPFS_HOME/docs/$tar;
        
        echo hadoop fs -put $TMPFS_HOME/docs/$tar $HDFS_HOME/raw/$site/$month/;
        # upload to HDFS
        hadoop fs -put $TMPFS_HOME/docs/$tar $HDFS_HOME/raw/$site/$month/;
        # delete local files
        rm -r $TMPFS_HOME/docs/$tar;
        
        echo >&1000
    } &
done
echo hadoop fs -put $DATA_HOME/$month/$site/*.gz $HDFS_HOME/raw/$site/$month/
hadoop fs -put $DATA_HOME/$month/$site/*.gz $HDFS_HOME/raw/$site/$month/
#for gzpath in $DATA_HOME/$month/$site/*.gz;
#do
#    read -u1000
#    {
#        echo hadoop fs -put $gzpath $HDFS_HOME/raw/$site/$month/;
#        # upload to HDFS
#        hadoop fs -put $gzpath $HDFS_HOME/raw/$site/$month/;
#        # delete local files
#        
#        echo >&1000
#    } &
#done
wait;

echo "tar finished"

# delete local files
rm -r $TMPFS_HOME/docs
