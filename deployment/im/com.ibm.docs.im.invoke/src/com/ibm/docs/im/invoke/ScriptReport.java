package com.ibm.docs.im.invoke;
import java.util.List;
import java.text.MessageFormat;

import org.eclipse.core.runtime.IStatus;

import com.ibm.cic.agent.core.api.IInvokeContext;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.invoke.internal.Messages;

// script_error is size 2 array, the first element is the error code
// the second element is the error message.
public class ScriptReport
{
  public static String[] getScriptError(String log)
  {
    String[] script_error = new String[2];
    int start = log.indexOf(Constants.IM_LOG_PREFIX + "ERROR:") + 12;
    int end = log.indexOf(":", start);
    script_error[0] = log.substring(start, end);
    if(  end < log.length() )
    {
      script_error[1] = log.substring(end+1);
    }
    else
    {
      script_error[1] = "";
    }
    return script_error;
  }
  
  public static String[] getErrirString(String[] script_error)
  {
    String[] m = new String[4];
    m[0] = Messages.getString(script_error[0] + "$uuid");
    m[1] = Messages.getString(script_error[0] + "$explanation");
    m[2] = Messages.getString(script_error[0] + "$useraction");  
    m[3] = script_error[1];
    return m;    
  }
  public static IStatus getErrorStatus(IInvokeContext context, String shortComponent, String logToMonitor, List<String> IM_logs)
  {    
    IProfile profile = context.getProfile();    
    String[] script_error = new String[2];
    script_error[0] = "Message_PythonProcessFailed";
    script_error[1] = MessageFormat.format(Messages.getString("Message_PythonProcessFailed$msg"),new Object[] { shortComponent, logToMonitor });
        
    for (int i = IM_logs.size()-1; i >=0; i-- )
    {
      if(IM_logs.get(i).contains(Constants.IM_LOG_PREFIX + "ERROR:"))
      {
        script_error = getScriptError(IM_logs.get(i));
        break;
      }        
    }    
    String[] m = getErrirString(script_error);      
    IStatus status = IMStatuses.ERROR.get(m[0], m[1], m[2], 1, m[3]);
    return status;    
  }
}
