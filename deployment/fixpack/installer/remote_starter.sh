#!/bin/sh

while [ "$1" != "" ]
do
	case $1 in
		-zip)
			zip=$2
			shift 2
			;;
		-installroot)
			installroot=$2
			shift 2
			;;
		-symcount)
			symcount=$2
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
action_cmd=upgrade_node.sh
params="--installroot $installroot --symcount $symcount"

echo $action_cmd $params
sh $action_cmd $params
rm -rf $destDirPath
