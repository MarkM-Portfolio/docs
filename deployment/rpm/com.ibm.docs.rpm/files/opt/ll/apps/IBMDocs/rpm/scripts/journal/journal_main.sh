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
	echo "* /opt/IBM/IBMDocs/journal/$BATCH_NAME <journal_directory> <journal_server_url> <common_journal_dir>"
	echo "*"
	echo "* Sample: /opt/IBM/IBMDocs/journal/$BATCH_NAME /opt/IBM/IBMDocs/journal/ http://journal.lotuslive.com:9080 /opt/ll/scripts/journal"
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
if [ $# -lt 3 ]
then
        UsageHelp
        exit 1
fi



#.init

JOURNAL_DIR=$1
JOURNAL_CLIENT_SCRIPTS=$3

SYNC_UPLOAD_COMMAND="${JOURNAL_CLIENT_SCRIPTS%/*}/sync.sh docsupl ${JOURNAL_CLIENT_SCRIPTS%/*}/journalUpload.sh DOCS $2/journal/upload/"
UPLOADING_DIR="uploading"



#.main
for server in `ls $JOURNAL_DIR`
do
	if [ -d ${JOURNAL_DIR%/*}/$server ]
	then
		lock_file="null.lck"
		index=0

		for file in `ls -tr ${JOURNAL_DIR%/*}/$server | grep .lck$`
		do
			if [ $index -eq 0 ]
			then
				index=`expr $index + 1`
				lock_file=$file
			else
				rm -f ${JOURNAL_DIR%/*}/$server/$file
			fi
		done

		for file in `ls -tr ${JOURNAL_DIR%/*}/$server | grep .log$ | grep -v .lck$` 
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
				else
					echo "[$server][$file]: conflict found, skipped the upload."
				fi
			fi
		done

		if [ `ls ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR | grep .log$ | wc -l` != 0 ]
		then
			echo "[$server]: executing... $SYNC_UPLOAD_COMMAND ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR/ json 'journal_docs_*.log'"
			$SYNC_UPLOAD_COMMAND ${JOURNAL_DIR%/*}/$server/$UPLOADING_DIR/ json 'journal_docs_*.log'
			echo "[$server]: completed."
		else
			echo "[$server]: completed. not found any journal files."
		fi
	fi
done

exit 0

