from xml.dom.minidom import parse, Document
from common_jython import check_tasks, PromotingCheck, CFG,common_dict
import exceptions
CFG_dict = None
class ConfigurablePrecheck(PromotingCheck):
    def __init__(self,element,parent=None,checkingParameters=None,product_name=None):
        ps = load_properties(element)
        myval = CFG_dict
        if product_name == None:
            ps['product_name'] = ''
        else:
            ps['product_name'] = product_name
        if checkingParameters == None:
            checkingParameters = []
        checkingParameters.append(common_dict.get_dict()[ps['checkingParameter']])
        ps['conditions'] = load_conditions(element)
        ps['checkTasks'] = load_tasks(self,ps['checkingParameter'],checkingParameters,element)
        ps['subPrechecks'] = load_sub_checks(element,self,checkingParameters)
        ps['parent'] = parent
        PromotingCheck.__init__(self,ps)

available_checks = {}
available_checks['ConfigurablePrecheck'] = ConfigurablePrecheck

product_name = None

available_tasks = {}
available_tasks['CheckExistence'] = check_tasks.CheckExistence
available_tasks['CheckIsFile'] = check_tasks.CheckIsFile
available_tasks['CheckIsPath'] = check_tasks.CheckIsPath
available_tasks['CheckWritable'] = check_tasks.CheckWritable
available_tasks['CheckReadable'] = check_tasks.CheckReadable
available_tasks['CheckExecutable'] = check_tasks.CheckExecutable
available_tasks['CheckIsDrive'] = check_tasks.CheckIsDrive
available_tasks['CheckIsClient'] = check_tasks.CheckIsClient
available_tasks['CheckIsServer'] = check_tasks.CheckIsServer
available_tasks['CheckURL'] = check_tasks.CheckURL
available_tasks['CheckMatchPattern'] = check_tasks.CheckMatchPattern
available_tasks['CheckEquals'] = check_tasks.CheckEquals
available_tasks['CheckLCCPath'] = check_tasks.CheckLCCPath
available_tasks['CheckNFSSharing'] = check_tasks.CheckNFSSharing
def load_conditions(element):
    result = []
    conditions = element.getElementsByTagName("condition")
    for condition in conditions:
        if condition.parentNode == element and condition.attributes and len(condition.attributes)>0:
            item = {}
            names = condition.attributes.keys()
            for name in names:
                item[name] = condition.getAttribute(name)
            result.append(item)
    return result

def load_properties(element):
    result = {}
    result['summaryTemplate'] = "The value of '$name' specified in the $product_name cfg.properites file is not valid. The possible reason might be:"
    parameters = element.getElementsByTagName("parameter")
    for parameter in parameters:
        if parameter.parentNode == element:
            result[parameter.getAttribute('name')] = parameter.getAttribute('value')
    return result

def load_tasks(parent,checkingParameter,checkingParameters,element):
    result = []
    tasks = element.getElementsByTagName("task")
    for task in tasks:
        if task.parentNode == element:
            if task.getAttribute('type') in available_tasks:
                names = None
                para = {}
                if task.attributes:
                    names = task.attributes.keys()
                    for name in names:
                        if name == 'expectResult' or name == 'isHungCase':
                            if task.attributes[name].value == 'true':
                                para[name] = True
                            else:
                                para[name] = False
                        elif name == 'type':
                            continue
                        else:
                            para[name] = task.attributes[name].value
                
                para['ownerCheck'] = parent
                para['checkingParameter'] = checkingParameter
                para['checkingParameters'] = checkingParameters
                result.append(available_tasks[task.getAttribute('type')](para))
            else:
                raise Exception
    return result

def load_sub_checks(element,parent=None,checkingParameters=None):
    product_name = None
    if parent == None and element.getAttribute('productName'):
        product_name = element.getAttribute('productName')
    result = []
    prechecks = element.getElementsByTagName("precheck")
    for precheck in prechecks:
        if precheck.parentNode == element:
            if precheck.getAttribute('type') in available_checks:
                result.append(available_checks[precheck.getAttribute('type')](precheck,parent,checkingParameters,product_name))
    return result

def load_checks(path):
    #try:
    #    doc = parse(path)
    #    root = doc.documentElement
    #    return loadSubChecks(root)
    #except:
    #    return []
    doc = parse(path)
    root = doc.documentElement
    return load_sub_checks(root)
