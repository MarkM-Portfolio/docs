package com.ibm.docs.alfresco.cmis;

import javax.servlet.http.Cookie;

import org.apache.chemistry.opencmis.client.bindings.spi.BindingSession;
import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;

import com.ibm.concord.viewer.config.URLConfig;
import com.ibm.docs.alfresco.util.Constants;

public class ViewAuthenticationProvider extends StandardAuthenticationProvider
{
  private static final long serialVersionUID = 4664058649268958765L;

  private static final String USER_KEY = "org.apache.chemistry.opencmis.user";
  
  private static final String PASSWORD_KEY = "org.apache.chemistry.opencmis.password";
  
  private static final String ROLE_TICKET = "ROLE_TICKET";

  public void setSession(BindingSession session)
  {   
    String ticket = null;
    Cookie[] cookies = URLConfig.getRequestCookies(); // Include com.ibm.concord.viewer.config.jar in build path
    for (int i = 0; i < cookies.length; i++)
    {
      Cookie c = cookies[i];
      String name = c.getName();
      String value = c.getValue();
      if (Constants.CODE.equalsIgnoreCase(name))
      {
        ticket = value;
        break;
      }
    }
    
    session.put(USER_KEY, ROLE_TICKET);     
    session.put(PASSWORD_KEY, ticket);
    super.setSession(session);      
  }
}
