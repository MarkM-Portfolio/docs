import logging
from common_jython import command, CFG, common_dict
from string import Template

class HungingCheck (command.Command):
    def __init__(self,ps):
        self.preStr = "***** "
        self.headerFooterStr = "**************************************************************************************************"
        self.checkingParameters = None
        self.conditions = ps['conditions']
        self.parent = ps['parent']
        self.checkingParameter = {'name':ps['checkingParameter'],'value':common_dict.get_dict()[ps['checkingParameter']]}
        self.seriousLabelString = "A serious issue is detected while checking the configuration parameters."
        self.labelString = "An issue is detected while checking the configuration parameters."
        myDict = {'name':ps['checkingParameter'],'value':common_dict.get_dict()[ps['checkingParameter']],'product_name':ps['product_name']}
        self.summaryString = Template(ps['summaryTemplate']).substitute(myDict)
        self.checkTasks = ps['checkTasks']
        self.subPrechecks = ps['subPrechecks']
        if 'possibleCases' in ps:
            self.possibleCases = parameters['possibleCases']
        else:
            self.possibleCases = []

        self.hungCase = ''
        self.isBreak = True
        self.ending = "The deployment process was broken by issues above. Check the corresponding parameter and try again."
        
    def set_hung_case (self,description):
        self.hungCase = description
        
    def append_possible_case(self,description):
        self.possibleCases.append(description)
        
    def append_possible_cases(self,descriptions):
        self.possibleCases.extend(descriptions)
        
    def readCfg(self,cfg=None):
        return True
    
    def verify_conditions(self):
        for condition in self.conditions:
            if common_dict.get_dict()[condition['name']] ==  condition['value'] and condition['expectResult'] == 'false':
                return False
            if common_dict.get_dict()[condition['name']] !=  condition['value'] and condition['expectResult'] == 'true':
                return False
        return True
    
    def do(self):
        try:
            if not self.verify_conditions():
                return True
            if self.verify():
                return True
            elif self.parent:
                self.parent.append_possible_case(self.summaryString)
                self.parent.append_possible_cases(self.possibleCases)
                return False
            else:
                self.show_header_footer()
                self.show_label()
                self.show_summary()
                self.show_header_footer()
                self.show_promote()
                if (self.isBreak):
                   return False
                else:
                   return True
        except Exception:
            if self.parent:
                self.parent.set_hung_case(self.hungCase)
                self.parent.append_possible_cases(self.possibleCases)
                raise
            else:
                self.show_header_footer()        
                self.show_serious_label()
                self.show_serious_summary()
                self.show_header_footer()
                return False
            
    def do_upgrade(self):
        try:
            if not self.verify_conditions():
                return True
            if self.verify():
                return True
            elif self.parent:
                self.parent.append_possible_case(self.summaryString)
                self.parent.append_possible_cases(self.possibleCases)
                return False
            else:
                self.show_header_footer()
                self.show_label()
                self.show_summary()
                self.show_header_footer()
                self.show_promote()
                if (self.isBreak):
                   return False
                else:
                   return True
        except Exception:
            if self.parent:
                self.parent.set_hung_case(self.hungCase)
                self.parent.append_possible_cases(self.possibleCases)
                raise
            else:
                self.show_header_footer()        
                self.show_serious_label()
                self.show_serious_summary()
                self.show_header_footer()
                return False
    def show_header_footer(self):
        logging.warning(self.headerFooterStr)
    def show_label(self):
        logging.warning( self.preStr+self.labelString)
        
    def show_serious_label(self):
        logging.warning( self.preStr+self.seriousLabelString)
        
    def show_summary(self):
    	logging.warning( self.preStr+self.summaryString)
        for case in self.possibleCases:
            logging.warning( self.preStr+case)
        
    def show_serious_summary(self):
    	logging.warning( self.preStr+self.summaryString)
    	logging.warning(self.preStr+self.hungCase)
    	if len(self.possibleCases)>0:
    	    logging.warning(self.preStr+"There might be other existing issues:")
            for case in self.possibleCases:
                logging.warning( self.preStr+case)
            
    def show_promote(self):
        logging.warning(self.preStr+self.ending)
    
    def verify(self):
        result = True
        for task in self.checkTasks:
            result = task.check() and result
            
        for subCheck in self.subPrechecks:
            result = subCheck.do() and result
        return result
        
    
    
