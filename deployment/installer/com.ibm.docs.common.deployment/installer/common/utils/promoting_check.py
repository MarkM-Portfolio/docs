import logging
from common import command, HungingCheck, CFG

class PromotingCheck (HungingCheck):
    def __init__(self,ps):
        HungingCheck.__init__(self,ps)
        self.promteString = "Do you want to continue deploying? (c)ontinue, (b)reak:"
        self.silentlyPromote = "In SILENT deployment mode, the deployment process will be continued by default."
    def show_promote(self):
        if CFG.is_silently_install():
            logging.warning(self.silentlyPromote)
            self.isBreak = False
        else:
            while True:
                response = input(self.promteString)
                #response = response[:-1]
            
                tag = response[0].lower()
                if tag == 'c':
                    self.isBreak = False
                    break
                elif tag == 'b':
                    break
