# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# OCO Source Materials                                              
#                                                                   
# Copyright IBM Corp. 2019                                   
#                                                                   
# The source code for this program is not published or otherwise    
# divested of its trade secrets, irrespective of what has been      
# deposited with the U.S. Copyright Office.                         
#                                                                   
# ***************************************************************** 

import sys, re, socket, os, subprocess, grp, pwd, traceback
sys.path.append('/opt/ll/lib/registry')
from registryLib import *
sys.path.append('/opt/ll/lib/apache/zookeeper')
from zooKeeperLib import *
sys.path.append('/opt/ll/lib/nfs')
import mountLib

#---------------------------------------------------------------------------------------------
# Helper executeCommand
#---------------------------------------------------------------------------------------------
def executeCommand(command, zooKeeperClient=None):
    print('Executing: ' + command)
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output = p.communicate()[0]
    if p.returncode:
       print('RC %s while %s' % (p.returncode, command))
       if zooKeeperClient:
           zooKeeperClient.updateActivationStatus('OH NO: blkid command f4iled while trying to identify partition - Please check SoftLayer partitions.')
       raise Exception('RC %s while %s' % (p.returncode, command))
       return 1
    print('Command successful')
    return output

#---------------------------------------------------------------------------------------------
# Function that identifies the partition ID of a block device
#---------------------------------------------------------------------------------------------
def gatherBlockDeviceDetails(zooKeeperClient, path):
    cmdoutput = executeCommand("blkid %s" % (path), zooKeeperClient )
    if cmdoutput==1:
        return "fail"
    guidMatch = re.match(".*UUID=[\"']([-\w]+)[\"']", cmdoutput )
    print('test')
    return "UUID=%s\t/disks/shared\text4\tdefaults\t0 0" % ( guidMatch.group(1) )

#---------------------------------------------------------------------------------------------
# Mount extra disks for VMWare Use Case
#---------------------------------------------------------------------------------------------
def mountExtraDiskVMWare():
    device = '/dev/sdb1'
    try:
        mountLib.setupFSTabWithLocalDisk(device,mountPoint)
        mountLib.mountFilesystem(mountPoint,'ext3')
    except:
        print('Warning:  Unable to setup additional disk for device %s.  Skipping...' % (device))
        raise Exception('Unable to setup additional disk for device!')
        traceback.print_exc()

#---------------------------------------------------------------------------------------------
# Mount extra disks for SL VM Use Case
#---------------------------------------------------------------------------------------------
def mountExtraDiskSLVM():
    print('Creating additional partition...')
    cmd = '/opt/ll/apps/ViewerNext/rpm/Viewer/installer/createPartition.sh'
    executeCommand(cmd)
    device = "/dev/xvdc1"
    try:
        #Commenting based on comment from Alan
        os.system("mkfs -t ext3 /dev/xvdc1")
        #Update fstab
        f = open('/etc/fstab','a')
        f.write('/dev/xvdc1\t\t/disks/shared\text3\tdefaults\t0 0\n')
        f.close()
        os.chmod('/etc/fstab',0o644)

        os.system("mkdir -p /disks/shared")
        os.system("mount /disks/shared")
    except:
        print('Warning:  Unable to update fstab and/or mount /dev/xvdc1 to /disks/shared...')
        raise Exception('Unable to update fstab and/or mount /dev/xvdc1 to /disks/shared...')        
        traceback.print_exc()

#---------------------------------------------------------------------------------------------
# Mount extra disks for SL BareMetal Use Case
# Step 1 - Tear down anything existing after reload (Unmount, luks, fstab entry, reformat partition)
# Step 2 - get UUID, create fstab entry, mount to /disks/shared
#---------------------------------------------------------------------------------------------
def mountExtraDiskSLBM():
    #Step 1
    # Check first if the additional disks are already configured in fstab and needs to be removed.
    device="/dev/sda6"
    fstabFH = open("/etc/fstab", "r")
    initialContents = fstabFH.readlines()
    fstabFH.close()
    adjustedContents = []
    for line in initialContents:
        line = line.strip()
        if not line or line.startswith("#"):
            adjustedContents.append(line)
        else:
            entry = line.split()
            if entry[1] == "/disk0":
                executeCommand("umount /disk0")
            elif entry[1] == "/disks/shared":
                executeCommand("umount /disks/shared")
            else:
                adjustedContents.append(line)
    #Write out fstab without secondary partition.
    fstabFH = open("/etc/fstab", "w")
    fstabFH.write("\n".join(adjustedContents) + "\n")
    fstabFH.close()
    #Reformat with ext4.
    print(executeCommand("mkfs.ext4 "+device))

    #Step 2
    mountConfig = gatherBlockDeviceDetails(zooKeeperClient,device)
    if mountConfig=="fail":
        raise Exception('Failed to configure mountpoint. Check the partitions with SC Ops.')
    # Create the empty directories that the disks will be mounted as.
    if not os.path.exists("/disks/shared"):
        os.makedirs("/disks/shared", mode=0o755)
    adjustedContents.append(mountConfig)
    # Write the new fstab entry with the correctly located mounts.
    fstabFH = open("/etc/fstab", "w")
    fstabFH.write("\n".join(adjustedContents) + "\n")
    fstabFH.close()
    executeCommand("mount /disks/shared")

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------
#Set Global variables
mountPoint = '/disks/shared'
registryParser = RegistryParser()
zooKeeperClient = ZooKeeperClient()
def main():
    # Is softlayer environment?
    if registryParser.getSetting('MiddlewareZooKeeper','data_center_type') == 'softlayer':
        output = executeCommand("dmesg")
        searchObj = re.search(r'xen', output, re.M|re.I)
        if searchObj == None: #SL BareMetal Use Case
            print("Executing SoftLayer Bare Metal Use Case")
            mountExtraDiskSLBM()
        else: #SL VM Use Case
            print("Executing SoftLayer VM Use Case")
            mountExtraDiskSLVM()
    else:# VMWare Use Case
        print("Executing VMWare Use Case")
        mountExtraDiskVMWare()

    #Change Permissions of folders along mount path to 0755
    try:
        if os.path.exists(mountPoint):
            #Ensure the permissions are correct
            path = ''
            for directory in mountPoint.lstrip('/').split('/'):
               path += '/%s' % (directory)
               os.chmod(path,0o755)
    except:
        print('Warning:  Unable to mount or set prmissions properly for %s' % (mountPoint))
        traceback.print_exc()

if __name__=='__main__':
    try:
        main()
    except Exception as e:
        logging.exception(e)
        logging.error("Setup local disk for Viewer failed, check log file for more detail.")
        raise Exception('Setup local disk Failed')    

