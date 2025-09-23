#! /bin/sh

BATCH_NAME=journal_main.sh
BATCH_VERSION=1.0

UsageHelp()
{
	echo "**************************************************************************************************"
	echo "* [$BATCH_NAME] v$BATCH_VERSION"
	echo "*"
	echo "* [Dependencies]"
	echo "* sync.sh"
	echo "* uploadJournal.sh"
	echo "*"
	echo "* [Usage]"
	echo "* /opt/IBM/Docs/$BATCH_NAME <journal_directory> <journal_server_url>"
	echo "*"
	echo "* Sample: /opt/IBM/Docs/$BATCH_NAME /opt/IBM/Docs/journal http://journal.lotuslive.com:9080"
	echo "*"
	echo "* [Description]"
	echo "* The main script entry for uploading HCL Docs journal files to SmartCloud journal server."
	echo "* This script could be invoked from a CRON job to periodically upload journal files."
	echo "*"
	echo "* The journal directory, such as <IBM_DOCS_JOURNAL_ROOT>/journal, which is supposed to"
	echo "* directly contain server named directories and then journal files of the server."
	echo "*"
	echo "* Both sync.sh and uploadJournal.sh should be put in the same directory of this script."
	echo "**************************************************************************************************"
}



#.check
if [ $# -lt 2 ]
then
        UsageHelp
        exit 1
fi



#.init
MAIN_SCRIPT=$0
JOURNAL_DIR=$1
SYNC_UPLOAD_COMMAND="${MAIN_SCRIPT%/*}/sync.sh docsupl ${MAIN_SCRIPT%/*}/journalUpload.sh DOCS $2/journal/upload/"
UPLOADING_DIR="uploading"



#.main
for server in `ls $JOURNAL_DIR`
do
	if [ -d ${JOURNAL_DIR%/*}/$server ]
	then
		lock_file=""
		index=0
		ALL_LOGS=""

		for file in `ls -tr ${JOURNAL_DIR%/*}/$server | grep ".lck"`
		do
			if [ $index -eq 0 ]
			then
				index=`expr $index + 1`
				lock_file=$file
			else
				rm -f ${JOURNAL_DIR%/*}/$server/$file
			fi
		done

		for file in `ls -tr ${JOURNAL_DIR%/*}/$server | grep ".log" | grep -v ".lck"` 
		do
			if [ ${lock_file%.*} != $file ]
			then
				if [ ! -d ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR ]
				then
					mkdir ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR
				fi

				if [ ! -f ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR/$file ]
				then
					mv ${JOURNAL_DIR%/*}/$server/$file ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR/$file
					ALL_LOGS="$ALL_LOGS $file"
				else
					echo "[$server][$file]: conflict found, skipped the upload."
				fi
			fi
		done

		if [ -n "$ALL_LOGS" ]
		then
			echo "[$server]: Executing... \"$SYNC_UPLOAD_COMMAND ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR/ json 'journal_docs_*.log'\""
			sleep 10
			echo "[$server]: Finished Successfully"
		else
			echo "[$server]: not found any journal files for uploading."
		fi
	fi
done

exit 0

