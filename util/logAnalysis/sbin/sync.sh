#/bin/bash

LOCAL_PATH=/home/bjyangyf/rawdata
SERVER_PATH=/LogCollectionFacility
A3LOGSERVER=logserver.dal09.isc4sb.com
G3LOGSERVER=logserver.ams03.isc4sb.com

if [ $# -ne 1 ]; then
    echo "usage: shell month";
    exit 1;
fi
month=$1;
mkdir $LOCAL_PATH
mkdir $LOCAL_PATH/$month
echo a3
mkdir $LOCAL_PATH/$month/a3
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs1a/ $LOCAL_PATH/$month/a3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs1b/ $LOCAL_PATH/$month/a3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs2a/ $LOCAL_PATH/$month/a3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs2b/ $LOCAL_PATH/$month/a3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs3a/ $LOCAL_PATH/$month/a3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs3b/ $LOCAL_PATH/$month/a3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs4a/ $LOCAL_PATH/$month/a3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$A3LOGSERVER:$SERVER_PATH/a3/docs4b/ $LOCAL_PATH/$month/a3/

echo g3
mkdir $LOCAL_PATH/$month/g3
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$G3LOGSERVER:$SERVER_PATH/g3/docs1a/ $LOCAL_PATH/$month/g3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$G3LOGSERVER:$SERVER_PATH/g3/docs1b/ $LOCAL_PATH/$month/g3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$G3LOGSERVER:$SERVER_PATH/g3/docs2a/ $LOCAL_PATH/$month/g3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$G3LOGSERVER:$SERVER_PATH/g3/docs2b/ $LOCAL_PATH/$month/g3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$G3LOGSERVER:$SERVER_PATH/g3/docs3a/ $LOCAL_PATH/$month/g3/
rsync -zvri --include "*$month*" --exclude "*" bjyangyf@$G3LOGSERVER:$SERVER_PATH/g3/docs3b/ $LOCAL_PATH/$month/g3/
