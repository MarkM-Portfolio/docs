import sys, getopt, os;

execfile('/opt/ll/scripts/ac/wsadminlib.py')

print 'Stopping Engage_Cluster...'
stopCluster('Engage_Cluster')
print 'Stopping clusterS...'
stopCluster('clusterS')

print 'Starting Engage_Cluster...'
startCluster('Engage_Cluster')
print 'Starting clusterS...'
startCluster('clusterS')

print 'Engage_Cluster and clusterS restarted.'