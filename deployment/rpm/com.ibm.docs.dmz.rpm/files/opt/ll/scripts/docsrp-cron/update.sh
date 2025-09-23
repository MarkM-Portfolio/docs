#!/bin/sh

# log file
LOGFOLDER="/opt/ll/logs/docsrp-cron" 
LOG="${LOGFOLDER}/update.log"
if [ ! -d ${LOGFOLDER} ]; then
  mkdir -p ${LOGFOLDER}
fi

MAXLOGS=9
MAXSIZE=10240 #KB


# get current log files size
SIZE=0
if [ -f ${LOG} ]; then
  SIZE=`du ${LOG} |cut -f1`
fi

# rotate if the logs is extending the count or size
if [ $SIZE -gt ${MAXSIZE} ]; then
  TIMESTAMP=`date -u +%s`
  mv ${LOG} ${LOGFOLDER}/update_${TIMESTAMP}.log  
  touch ${LOG}   
  LIST=($(ls --sort t ${LOGFOLDER} |grep update_))
  COUNT=${#LIST[@]}    
  if [ $COUNT -gt ${MAXLOGS} ]; then    
    for ((i=0; i<$COUNT; i++)); do
      AFILE=${LIST[$i]}      
      if [ $i -gt ${MAXLOGS} ]; then
        echo "removing: ${LOGFOLDER}/${AFILE}" >>${LOG} 2>&1
        rm -f ${LOGFOLDER}/${AFILE}
      fi
    done
  fi  
fi

# locker file
LOCKER="${LOGFOLDER}/running.lock"

# check if there is a running scripts
if [ -f ${LOCKER} ]; then
  if [ "$(ps -p `cat ${LOCKER}` | wc -l)" -gt 1 ]; then
  # still running
    echo "$0: is still running..." >>${LOG} 2>&1
    exit 0
  else
  # not running, need remove the obsolete locker
    echo "$0: is not running, but leave a locker! deleted!" >>${LOG} 2>&1
    rm -f ${LOCKER}
  fi  
fi

# create a locker and record the pid
echo $$ >${LOCKER}

export PATH=$PATH:/sbin
export PYTHONPATH=$PYTHONPATH:$PWD
echo "Start Date: " `date -u` >>${LOG} 2>&1

# check and update the nodes
SCRIPTS=/opt/ll/scripts/docsrp-cron
cd ${SCRIPTS}
python ${SCRIPTS}/updateDMZ.py >>${LOG} 2>&1
echo "Finished Date: " `date -u` >>${LOG} 2>&1

# remove locker
rm -f ${LOCKER}