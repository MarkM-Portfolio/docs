#!/usr/bin/env bash

# Copyright (c) 2003-2009, Frederico Caldeira Knabben. All rights reserved.
# For licensing, http://yuilibrary.com/license/

TMPLOG="antlrreleaserlog.log";
rm -f $TMPLOG

mkdir $1
java -jar buildtools/yuicompressor-2.4.7.jar $2 -o $3 2>&1 | tee $TMPLOG
java -jar buildtools/yuicompressor-2.4.7.jar $4 -o $5 2>&1 | tee $TMPLOG

SUCCESS_STR=`cat $TMPLOG | grep `

if [ "$SUCCESS_STR" = "" ]
then 
	echo antlrReleaser passed
	exit 0
else 
	echo antlrReleaser failed
	exit -1
fi
