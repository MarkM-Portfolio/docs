#!/usr/bin/env bash

# Copyright (c) 2003-2009, Frederico Caldeira Knabben. All rights reserved.
# For licensing, see LICENSE.html or http://ckeditor.com/license

TMPLOG="ckreleaserlog.log";
rm -f $TMPLOG

if [ -L $0 ] ; then
    DIR=$(dirname $(readlink -f $0)) ;
else
    DIR=$(dirname $0) ;
fi ;

pushd $DIR
#java -jar ckreleaser/ckreleaser.jar ckreleaser.release ../.. release "3.0 SVN" ckeditor_3.0_svn
java -jar ckreleaser.jar $1 $2 $3 $4 $5 2>&1 | tee $TMPLOG

SUCCESS_STR=`cat $TMPLOG | grep "Release process completed"`
popd

if [ "$SUCCESS_STR" = "" ]
then 
	echo ckreleaser failed
	exit -1
else 
	echo ckreleaser passed
	exit 0
fi
