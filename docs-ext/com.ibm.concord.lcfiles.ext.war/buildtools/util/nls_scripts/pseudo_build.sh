#!/bin/sh
# ***************************************************************** 
#                                                                   
# HCL Confidential                                                  
#                                                                   
# OCO Source Materials                                              
#                                                                   
# Copyright HCL Technologies Limited 2022                           
#                                                                   
# The source code for this program is not published or otherwise    
# divested of its trade secrets, irrespective of what has been      
# deposited with the U.S. Copyright Office.                         
#                                                                   
# ***************************************************************** 

###################################################################
# 1.this script call ant -f pseudo_build.xml to pseudo translate en resource 
# to widechar non-english resource, trans one time, 
# 2.and then copy zz_ZZ folder as non-english resource, 
# 3.and replace langauge settings in the resource, e.g.
# lang['en'] ---> lang['zh-cn']
# 4.also create multi-languages source tree as dojo or ck resource
###################################################################

src_folder=$1
pseudo_tfolder=$2
rpx_home=$3
if [ "$src_folder" = "" -o "$pseudo_tfolder" = "" -o "$rpx_home" = "" ]
then
	echo ERROR:source code folder and psuedo temporary folder must be assigned!!!
	echo USAGE:$0 source_code_folder psuedo_translate_temp_folder.
	exit 1
fi

if [ ! -d $pseudo_tfolder ]
then
	echo ERROR:Pseudo resource folder \"$pseudo_tfolder\" does not exist, please double check and then run again......
	exit 1
fi
if [ ! -d $src_folder ]
then
	echo ERROR:source folder \"$src_folder\" does not exist, please double check and then run again......
	exit 1
fi
if [ "$ANT_HOME" = "" ]
then
	echo ERROR:ANT_HOME was not defined, pseudo build terminated, please define ANT_HOME and then run again......
	exit 1
fi
SCRIPT_PREFIX=`dirname $BASH_SOURCE`

# set pseudo languages,
plangs=(zh-cn ja ru el tr fr pl de)

osgi_dir=`pwd`


#get nls folder
cd $src_folder
nls_folder=`find $src_folder -type d -name "com.ibm.*.nls"`

$ANT_HOME/bin/ant -f ${SCRIPT_PREFIX}/pseudo_build.xml -Dant.path=$ANT_HOME/lib -Dpiisrcdir=$pseudo_tfolder -Drpx.path=$rpx_home


psf_length=${#pseudo_tfolder}
psf_length=$((psf_length + 1))

for afo in `find $pseudo_tfolder -type d -name "zz-ZZ"`; do
	cd $afo/..
	curdir=`pwd`
	rafo=${curdir:$psf_length}
	for alang in ${plangs[@]}; do
		cp -fr zz-ZZ $alang
		if [ -f $alang/en.js ]
		then
			echo Debug info: This is a ck resource file, copy it to $nls_folder/$alang/$rafo
			mv $alang/en.js $alang.js
			perl -p -i -e "s/\'en\'/\'${alang}\'/g" ${alang}.js
			rm -rf ${alang}
			cp -f ${alang}.js $nls_folder/$alang/$rafo
		else
			echo Debug info: This is a dojo resource file, copy it to $nls_folder/$alang/$rafo
			cp -rf ${alang} $nls_folder/$alang/$rafo
		fi
	done
done

