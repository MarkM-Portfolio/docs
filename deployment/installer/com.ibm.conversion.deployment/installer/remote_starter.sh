#!/bin/sh

while [ "$1" != "" ]
do
	case $1 in
		-zip)
			zip=$2
			shift 2
			;;
		-action)
			action=$2
			shift 2
			;;
		-wasadminID)
			wasadminID=$2
			shift 2
			;;
		-wasadminPW)
			wasadminPW=$2
			shift 2
			;;
		-time)
			time=$2
			shift 2
			;;
		-installroot)
			installroot=$2
			shift 2
			;;
		*)
	esac
done

zip=`readlink -f $zip`
destDirPath=/tmp/docs_remote_installer
mkdir -p $destDirPath
unzip "$zip" -d $destDirPath
cd $destDirPath/installer

params="-acceptLicense -silentlyInstall -wasadminID $wasadminID -wasadminPW $wasadminPW -time $time"
if [ $action == install ]
then
	action_cmd=install_node.sh
else
	action_cmd=upgrade_node.sh
	params="$params -installRoot $installroot"
fi

echo $action_cmd $params
sh $action_cmd $params
rm -rf $destDirPath
