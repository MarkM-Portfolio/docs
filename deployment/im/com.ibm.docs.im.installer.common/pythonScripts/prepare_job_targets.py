register_host_args = '[-host %s -hostProps [ [username %s] [password %s] [osType %s] [saveSecurity true] %s ]]'
unregister_host_args = '[-host %s]'
query_target_args = '-maxReturn 20 -query "targetName=%s"'

def prepare_one_target (sudo_enabled, t):
  if not t[1]:
    if AdminTask.queryTargets( query_target_args % t[0]).find('[size 1]') > -1:
      return 1
    else:
      return 0
  try:
    AdminTask.unregisterHost(unregister_host_args % t[0])
  except:
    pass
  
  host_info = t
  if t[3] == 'linux' and sudo_enabled.lower() == 'true':
    host_info += ['[useSudo TRUE]']  
  else:
    host_info += ['']    
  AdminTask.registerHost(register_host_args % tuple(host_info))
  return 1

def prepare_job_target(args):
  sudo_enabled = args[0]
  targets = args[1].split(';')
  rets = ""
  nCount = 1;
  for target in targets:
    target_args = target.split(':')  
    #target_args.extend([hostname])
    #target_args.extend([username])
    #target_args.extend([password])
    #target_args.extend([ostype])
    try:
      if prepare_one_target(sudo_enabled, target_args):
        if nCount == 1:
          rets = target_args[0] + ":" + "True"
        else:
          rets = rets + ";" + target_args[0] + ":" + "True"
      else:
        if nCount == 1:
          rets = target_args[0] + ":" + "False"
        else:    
          rets = rets + ";" + target_args[0] + ":" + "False"
    except:
      if nCount == 1:
        rets = target_args[0] + ":" + "False"
      else:    
        rets = rets + ";" + target_args[0] + ":" + "False"
        
    nCount = nCount + 1
  
  print "PrepareJobTarget::::" + rets
if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  #hostname:username:password:ostype;
  prepare_job_target(sys.argv)
  