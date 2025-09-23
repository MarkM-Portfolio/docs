# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2022
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

# -*- encoding: utf8 -*-

import re, sys, os, subprocess, time, platform, time, math 
from multiprocessing import cpu_count
import logging as log

# Start
'''
Memory Size Unit is MB 
'''
SERVER_CPU_NUM = 2
SERVER_MEMORY_SIZE = 2560
SERVER_MEMORY_SIZE_INT = 1024 * 1 / 2
SERVER_MEMORY_SIZE_CLOUD_INT = 1024 * 1 / 3
SERVER_MEMORY_SIZE_MIN_INT = SERVER_MEMORY_SIZE_INT * 1 / 2 
SERVER_MEMORY_SIZE_NEW_INT = SERVER_MEMORY_SIZE_INT * 3 / 8 
JVM_ARGUS = '-Djava.awt.headless=true -Xquickstart -Xgcpolicy:gencon -Xdisableexplicitgc -Xcompressedrefs -XtlhPrefetch -Xsoftrefthreshold16 -Xgcthreads%s'

JVM_Parameter = [
    'initialHeapSize=768',
    'maximumHeapSize=2506',
    'verboseModeGarbageCollection=true',
    'genericJvmArguments=-Xgcpolicy:gencon -Djava.awt.headless=true -Xsoftrefthreshold16'
    ]


"""
    Both windows and linux , the Physical Memory is kB unit .
    And for this function to get memory for jvm , we need to use GB  unit .
"""
def factor(unit):
        """
        determine the convertion factor
        """
        if unit == 'kB':
            return 1
        if unit == 'MB':
            return 1 / 1024.0
        if unit == 'GB':
            return 1 / 1024.0 / 1024.0
        else:
            raise Exception("Unit not understood")

def get_win_memory():
    totalcmd = "wmic ComputerSystem get TotalPhysicalMemory"
    """
    Convert SERVER_MEMORY_SIZE to kB 
    """
    memory = SERVER_MEMORY_SIZE * 1024.0
    #print (memory * factor('GB'))
    try:
        p = subprocess.Popen(totalcmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
        memory = p.communicate()[0].strip().split('TotalPhysicalMemory')[1].strip()
        total_memroy = math.ceil(int(memory) / 1024.0 * factor('GB'))
        retval = p.returncode
        if retval:
            raise Exception('Error %s Get Memory Size Of Windows By Commond : (%s)' % (retval, cmd))
    except Exception as e:
        total_memroy = SERVER_MEMORY_SIZE
        log.info(e)
    finally:
        log.info("get_win_memory::total_memroy : %s GB" % total_memroy)
        return total_memroy

def get_win_cpu():
    """
     get cpu num 
    """
    # cpu_num = os.environ['NUMBER_OF_PROCESSORS']
    totalcmd = "wmic cpu get NumberOfLogicalProcessors"
    output_cpu = SERVER_CPU_NUM
    #print output_cpu
    try:
        p = subprocess.Popen(totalcmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
        output = p.communicate()[0]
        output_cpu = output.strip().split('NumberOfLogicalProcessors')[1].strip()
        # print output_cpu
        retval = p.returncode
        if retval:
            raise Exception('Error %s Get CPU Numbers Of Windows By Commond : (%s)' % (retval, cmd))
    except Exception as e:
        output_cpu = cpu_count()
        log.info(e)
    finally:
        log.info("get_win_cpu::output_cpu : %s" % get_win_cpu)
        return output_cpu

def get_linux_memroy():
    mem_total_kB = SERVER_MEMORY_SIZE * 1024.0
    # print math.ceil(int(mem_total_kB)* factor('GB'))
    try:
        meminfo = open('/proc/meminfo').read()
        matched = re.search(r'^MemTotal:\s+(\d+)', meminfo)
        if matched: 
            mem_total_kB = int(matched.groups()[0])
            total_memroy = math.ceil(mem_total_kB * factor('GB'))
    except Exception as e:
        total_memroy = SERVER_MEMORY_SIZE
        log.info('Error Get CPU Numbers Of Windows By Commond : (%s)' % (e))
    finally:
        log.info("get_linux_memroy::total_memroy : %s GB" % total_memroy)
        return total_memroy

def get_linux_cpu():
    totalcmd = "grep -c processor /proc/cpuinfo"
    output_cpu = SERVER_CPU_NUM
    try:
        p = subprocess.Popen(totalcmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
        output_cpu = p.communicate()[0].strip()
        retval = p.returncode
        if retval:
            raise Exception('Error %s Get CPU Numbers Of Linux By Commond : (%s)' % (retval, cmd))
    except Exception as e:
        output_cpu = cpu_count()
        log.info(e)
    finally:
        log.info("get_linux_cpu::output_cpu : %s" % output_cpu)
        return output_cpu

def get_cpus():
    """
    Detects the number of CPUs on a system. Cribbed from pp.
    """
    output_cpu = SERVER_CPU_NUM
    # Linux, Unix and MacOS:
    if hasattr(os, "sysconf"):
        if "SC_NPROCESSORS_ONLN" in os.sysconf_names:
            # Linux & Unix:
            ncpus = os.sysconf("SC_NPROCESSORS_ONLN")
            if isinstance(ncpus, int) and ncpus > 0:
                output_cpu = ncpus 
        else:  # OSX:
            output_cpu = int(os.popen2("sysctl -n hw.ncpu")[1].read())
    # Windows:
    if "NUMBER_OF_PROCESSORS" in os.environ:
        ncpus = int(os.environ["NUMBER_OF_PROCESSORS"]);
        if ncpus > 0:
            output_cpu = ncpus 
    log.info("get_cpus::output_cpu : %s" % output_cpu)
    return output_cpu

def set_jvm_parameter(jvm_parameter):
    log.info("set_jvm_parameter::jvm_parameter : %s" % jvm_parameter)
    if sys.platform.lower() == 'win32':
        try:
            total_memroy = get_win_memory()
            # cpu1 = get_win_cpu()
            cpu = get_cpus()
        except Exception as e:
            total_memroy = SERVER_MEMORY_SIZE 
            cpu = SERVER_CPU_NUM
            log.info(e)
        # print 'Windows : Total Memory : ',total_memroy , ' GB , CPUs : ' , cpu
    elif sys.platform.lower() == 'linux' or sys.platform.lower() == 'linux2':
        try:
            total_memroy = get_linux_memroy()
            # cpu1 = get_linux_cpu()
            cpu = get_cpus()
        except Exception as e:
            total_memroy = SERVER_MEMORY_SIZE 
            cpu = SERVER_CPU_NUM
            log.info(e)
        # print 'Linux : Total Memory : ',total_memroy , ' GB , CPUs : ' , cpu
    jvm_parameters_list = jvm_parameter
    jvm_parameters = []
    try:
        for setting in jvm_parameters_list:
            key, value = setting.split("=", 1)
            if 'initialHeapSize' == key:
              jvm_parameters.append(key + '=' + str(int(total_memroy * SERVER_MEMORY_SIZE_MIN_INT)))
              continue
            if 'maximumHeapSize' == key:
              jvm_parameters.append(key + '=' + str(int(total_memroy * SERVER_MEMORY_SIZE_CLOUD_INT)))
              continue
            if 'genericJvmArguments' == key:
              if (cpu - 1) == 0: 
                jvm_argus = (JVM_ARGUS % (cpu))
              else:
                jvm_argus = (JVM_ARGUS % (cpu - 1))
              jvm_parameters.append(key + '=' + jvm_argus)
              continue
            jvm_parameters.append(key + '=' + value)
    except Exception as e:
        jvm_parameters = jvm_parameter
        log.info(e)

    jvm_parameters_list = jvm_parameters
    log.info("set_jvm_parameter::jvm_parameters_list : %s" % jvm_parameters_list)
    return jvm_parameters_list

if __name__ == '__main__':
    jvm_parameters_list = set_jvm_parameter(JVM_Parameter)
    print(jvm_parameters_list) 
    
# End
