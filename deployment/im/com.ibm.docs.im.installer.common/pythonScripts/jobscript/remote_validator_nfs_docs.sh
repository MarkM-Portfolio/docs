#!/bin/sh
#working dir
cd $1
echo $1 >> docs_nfs_check.log
#nfs server ip/hostname for docs
echo $2 >> docs_nfs_check.log
#nfs server exported share point for docs
echo $3 >> docs_nfs_check.log
#mount dirver for docs
echo $4 >> docs_nfs_check.log

#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
if [ ! -d $4 ]; then
echo "Not Exist Client mount point for Docs" >> docs_nfs_check.log
fi 

if [ ! -w $4 -o ! -r $4 -o ! -x $4 ]; then
echo "No W or R or X access rights of client point for Docs" >> docs_nfs_check.log
fi

if [ -d /opt/nfs/docs ]; then
echo "The given directory has been existing already..." >> docs_nfs_check.log
rm -rf /opt/nfs/docs
fi

mkdir -p /opt/nfs/docs
chmod 777 -R /opt/nfs/docs
echo "NFS client mount checking for docs..." >> /opt/nfs/docs/docs_check.txt

mount $2:$3 /opt/nfs/docs >> docs_nfs_check.log

if [ -f $4/docs_check.txt ]; then
echo "The given verification file has been existing already..." >> docs_nfs_check.log
cd $4
rm -f docs_check.txt
ls
cd $1
fi

#cd $1
ls /opt/nfs/docs
if [ -f /opt/nfs/docs/docs_check.txt ]; then
echo "Failed to mount Docs Driver" >> docs_nfs_check.log
fi

cd $4
echo "Successfully Checked Docs NFS Mount Point" >> docs_check.txt
echo "NFS client checking for docs from another mount driver..." >> docs_check.txt

cd $1
ls /opt/nfs/docs
if [ ! -f /opt/nfs/docs/docs_check.txt ]; then
echo "The client point for Docs is not a mounted point." >> docs_nfs_check.log
fi
#cat /opt/nfs/docs/docs_check.txt >> docs_nfs_check.log

cd $4
rm -f docs_check.txt

cd $1
ls /opt/nfs/docs
if [ -f /opt/nfs/docs/docs_check.txt ]; then
echo "No DRight to delete file in mounted Docs Driver" >> docs_nfs_check.log
fi

cd /opt/nfs/docs
echo "Successful Checked Write Access Rights" >> docs_check.txt

cd $1
ls $4
if [ ! -f $4/docs_check.txt ]; then
echo "No WRight to create file in mounted Docs Driver." >> docs_nfs_check.log
fi

cat $4/docs_check.txt >> docs_nfs_check.log

rm -f /opt/nfs/docs/docs_check.txt >> docs_nfs_check.log

umount -f /opt/nfs/docs

rm -rf /opt/nfs/docs

mkdir logs
mv docs_nfs_check.log ./logs
