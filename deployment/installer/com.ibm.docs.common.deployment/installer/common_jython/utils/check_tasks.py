import os, platform, exceptions
from string import Template
from common_jython import HungingCheck, common_dict,CFG
from urllib import urlopen
import time
import threading
import Queue
import logging
#Common cases:

methods = {}
methods['exist'] = lambda x:os.access(x,os.F_OK)
methods['is_file'] = os.path.isfile
methods['is_path'] = os.path.isdir
methods['writable'] = lambda x:os.access(x,os.W_OK)
methods['readable'] = lambda x:os.access(x,os.R_OK)
methods['executable'] = lambda x:os.access(x,os.X_OK)

def check_in_thread_method (file_name,check_type ,result_queue):
    try:
        global methods
        if check_type in methods:
            if methods[check_type](file_name):
                result_queue.put(True)
    except:
        pass
    result_queue.put(False)  

class CheckTask:
    def __init__(self,parameters):
        mydict = {}
        self.isHungCase = parameters['isHungCase']
        self.expectResult = parameters['expectResult']
        self.ownerCheck = parameters['ownerCheck']
        self.checkingParameters = parameters['checkingParameters']+[]
        mydict['checkingPNV'] = parameters['checkingParameter']+':'+self.checkingParameters[-1]
        if 'appendix' in parameters:
            self.checkingParameters[-1] = self.checkingParameters[-1] + parameters['appendix']
        if 'prefix' in parameters:
            self.checkingParameters[-1] = parameters['prefix'] + self.checkingParameters[-1]
        templateTimeoutDescription = 'Time out (limit: 4 seconds) when checking "$checkingPNV";'
        if 'templateTimeoutDesciption' in parameters:
            templateTimeoutDescription =  parameters['templateTimeoutDesciption']
        self.timeoutDescription = Template(templateTimeoutDescription).substitute(mydict)
        if (self.expectResult):
            mydict['myVerb'] = parameters['trueVerb']
        else:
            mydict['myVerb'] = parameters['falseVerb']
        self.issueDescription = Template(parameters['templateDesciption']).substitute(mydict)
        self.methodInThread = None
        if 'methodInThread' in parameters:
            self.methodInThread = parameters['methodInThread']
    def get_checking_parameter(self):
        return self.checkingParameters.pop()
    def check(self):
        try:
            logging.debug( "Enter checking of pre-check task: "+self.__class__.__name__)
            if self.do_check() == self.expectResult:
                logging.debug( "Leave checking of pre-check task: "+self.__class__.__name__)
                return True
            else:
                raise Exception
        except Exception:
            if self.isHungCase:
                self.ownerCheck.set_hung_case(self.issueDescription)
                raise
            
        self.ownerCheck.append_possible_case(self.issueDescription)
        return False
    
    def do_check(self):
        raise Exception
    
    def check_in_thread(self):
        if self.methodInThread == None:
          return False
        rq = Queue.Queue()
        work_thread = threading.Thread(target = check_in_thread_method, 
                                        args = (self.get_checking_parameter(),self.methodInThread ,rq))        
        work_thread.start()
        work_thread.join(4)        
        if work_thread.is_alive():
          self.issueDescription = self.timeoutDescription
          return False
        if rq.empty() or not rq.get():
          return False
        return True
        
class CheckMatchPattern(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The given parameter: "$checkingPNV" $myVerb match the given pattern;'
        parameters['trueVerb'] = 'did not'
        parameters['falseVerb'] = 'do'
        self.pattern = parameters['pattern']
        CheckTask.__init__(self,parameters)
    def do_check(self):
        #versionFile = urlopen(self.checkingParameter+'/'+self.appendix)
        #if versionFile:
        #    if versionFile.getcode() == 200 or versionFile.getcode() == 304:
        #        return True

        return False

class CheckEquals(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The given parameter: "$checkingPNV" $myVerb to the given value;'
        parameters['trueVerb'] = 'does not equal'
        parameters['falseVerb'] = 'equals'
        self.value = parameters['value']
        CheckTask.__init__(self,parameters)
    def do_check(self):
        if self.get_checking_parameter() == self.value:
            return True
        return False

class CheckURL(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The URL: "$checkingPNV" $myVerb an available URL;'
        parameters['trueVerb'] = 'is not'
        parameters['falseVerb'] = 'is already'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        versionFile = urlopen(self.get_checking_parameter())
        if versionFile:
            if versionFile.getcode() != 404:
                if versionFile.getcode() < 500 or versionFile.getcode() > 599:
                    return True

        return False

class CheckExistence(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The path/file: "$checkingPNV" $myVerb;'
        parameters['templateTimeoutDesciption'] = 'Time out (limit: 4 seconds) when checking the existence of "$checkingPNV";'
        parameters['trueVerb'] = 'does not exist'
        parameters['falseVerb'] = 'already exists'
        parameters['methodInThread'] = 'exist'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        return self.check_in_thread()

class CheckIsFile(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The "file": "$checkingPNV" $myVerb a file name;'
        parameters['templateTimeoutDesciption'] = 'Time out (limit: 4 seconds) when checking whether "$checkingPNV" is a file;'
        parameters['trueVerb'] = 'is not'
        parameters['falseVerb'] = 'is'
        parameters['methodInThread'] = 'is_file'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        return self.check_in_thread()
    
class CheckIsPath(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The "path": "$checkingPNV" $myVerb a path;'
        parameters['templateTimeoutDesciption'] = 'Time out (limit: 4 seconds) when checking whether "$checkingPNV" is a path;'
        parameters['trueVerb'] = 'is not'
        parameters['falseVerb'] = 'is'
        parameters['methodInThread'] = 'is_path'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        return self.check_in_thread()
        
class CheckWritable(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The path/file: "$checkingPNV" $myVerb be written;'
        parameters['templateTimeoutDesciption'] = 'Time out (limit: 4 seconds) when checking the writable of "$checkingPNV";'
        parameters['trueVerb'] = 'can not'
        parameters['falseVerb'] = 'can'
        parameters['methodInThread'] = 'writable'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        return self.check_in_thread()
        
class CheckReadable(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The path/file: "$checkingPNV" $myVerb be read;'
        parameters['templateTimeoutDesciption'] = 'Time out (limit: 4 seconds) when checking the readable of "$checkingPNV";'
        parameters['trueVerb'] = 'can not'
        parameters['falseVerb'] = 'can'
        parameters['methodInThread'] = 'readable'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        return self.check_in_thread()
        
class CheckExecutable(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The file: "$checkingPNV" $myVerb be executed;'
        parameters['templateTimeoutDesciption'] = 'Time out (limit: 4 seconds) when checking the executable of "$checkingPNV";'
        parameters['trueVerb'] = 'can not'
        parameters['falseVerb'] = 'can'
        parameters['methodInThread'] = 'executable'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        return self.check_in_thread()
        
class CheckIsDrive(CheckTask):#For Windows Only
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The path: "$checkingPNV" $myVerb a root drive on Windows system;'
        parameters['trueVerb'] = 'is not'
        parameters['falseVerb'] = 'is'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        if 'Windows' != platform.system():
            return False
        pathStr = self.get_checking_parameter()
        split = os.path.splitdrive(pathStr)
        print split
        emptyStr = ''
        upperStr = pathStr.upper()
        if upperStr == split[0].upper():
            if emptyStr == split[1]:
                return True
        return False

class CheckIsClient(CheckTask):
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The path: "$checkingPNV" $myVerb mounted to NFS sharing path;'
        parameters['trueVerb'] = 'is not'
        parameters['falseVerb'] = 'is'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        return os.path.ismount(self.get_checking_parameter())

class CheckIsServer(CheckTask):#For Linux Only
    def __init__(self,parameters):
        parameters['templateDesciption'] = 'The path: "$checkingPNV" $myVerb shared in NFS mode;  Or the current platform is not a Linux system'
        parameters['trueVerb'] = 'was not been'
        parameters['falseVerb'] = 'was'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        if 'Linux' != platform.system():
            return False
        serverFile = open('/etc/exports')
        for line in serverFile:
            if line.find(self.get_checking_parameter()) != -1:
                return True

        return False
#Special cases:
class CheckLCCPath(CheckTask):#For LCExtension only
    def __init__(self,parameters):
        self.lccPath = os.path.join(parameters['checkingParameters'][-1], 
      'config', 'cells', CFG.get_cell_name(), 'LotusConnections-config')
        parameters['templateDesciption'] = 'The path: '+self.lccPath+' is not an available Lotus Connnections Configure path;'
        parameters['trueVerb'] = 'is not'
        parameters['falseVerb'] = 'already is'
        CheckTask.__init__(self,parameters)
    def do_check(self):
        if not os.access(self.lccPath,os.F_OK):
            return False
        if not os.path.isdir(self.lccPath):
            return False
        filenames = ['files-url-config.xml','files-config.xml','LotusConnections-config.xml']
        for filename in filenames:
            filepath = os.path.join(self.lccPath,filename)
            if not os.access(filepath,os.F_OK):
                return False
            if not os.path.isfile(filepath):
                return False
        return True

def file_write_thread_function (file_name, word, result_queue):
    try:
        input_file = open(file_name,'a+')
        input_file.writelines(word)
        input_file.close()
        result_queue.put(True)
    except:
        result_queue.put(False)

def file_read_thread_function (file_name, word, result_queue):
    try:
        verify_file = open(file_name,'r+')
        lines = verify_file.readlines()
        for line in lines:
            if line == word:
                result_queue.put(True)
                break
        verify_file.close()      
        os.remove(file_name)
    except:
        result_queue.put(False)
  
class CheckNFSSharing(CheckTask):
    def __init__(self,parameters):
      self.local_fail_str =  'Time out (limit: 4 seconds) when accessing the mounted local path: "'+parameters['checkingParameters'][0]+'". It is recommended that you reboot Conversion server and then try again.'
      self.remote_fail_str =  'Time out (limit: 4 seconds) when accessing the remote NFS share path: "//'+parameters['checkingParameters'][1]+parameters['checkingParameters'][2]+'". It is recommended that you reboot Conversion server and then try again.'
      parameters['templateDesciption'] = 'The local directory: '+parameters['checkingParameters'][0]+' has not been mounted to remote path: //'+parameters['checkingParameters'][1]+parameters['checkingParameters'][2]
      parameters['trueVerb'] = 'was not been'
      parameters['falseVerb'] = 'was'
      CheckTask.__init__(self,parameters)
    def do_check(self):
        result = False
        file_name = '/conversion_deployment.tst'
        isCIFS = False
        if common_dict.get_dict()['viewer_shared_storage_type'] == 'cifs':
          isCIFS = True
        remote_path_name = self.get_checking_parameter().replace("\\", "/")
        if isCIFS:
          remote_path_name = remote_path_name.replace(":","$")
          remote_path_name = '/'+remote_path_name
        remote_server_name = self.get_checking_parameter().replace("\\", "/")
        local_path = self.get_checking_parameter().replace("\\", "/") + file_name
        remote_path = '//'+remote_server_name+remote_path_name+file_name

        rq1 = Queue.Queue()
        word = "%f\n"%time.time()
        write_thread = threading.Thread(target = file_write_thread_function, 
                                        args = (local_path, word, rq1))        
        write_thread.start()
        write_thread.join(4)        
        if write_thread.is_alive():
          self.issueDescription = self.local_fail_str
          return False
        if rq1.empty() or not rq1.get():
          return False

        rq2 = Queue.Queue()
        read_thread = threading.Thread(target = file_read_thread_function, 
                                        args = (remote_path, word, rq2))        
        read_thread.start()
        read_thread.join(4)
        if read_thread.is_alive():
          self.issueDescription = self.remote_fail_str
          return False
        if rq2.empty() or not rq2.get():
          return False
        return True