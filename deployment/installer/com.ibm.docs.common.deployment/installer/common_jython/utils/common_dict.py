from common_jython import CFG
CFG_dict = None
def get_dict():
    global CFG_dict
    if CFG_dict == None:
        CFG_dict = dict(CFG.get_raw_key_value())
    return CFG_dict