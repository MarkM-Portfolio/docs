package com.ibm.concord.services.rest.handlers.docsvr;

import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.autopublish.AutoPublishUtil;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class DocumentAutoPublishHandler implements PostHandler
{
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONObject json = JSONObject.parse(request.getReader());
    boolean autoPublish= (Boolean) json.get("autopublish");
    
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    
    IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
    AutoPublishUtil.setAutoPublish(docEntry, autoPublish);
    
    DocumentSession docSess = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());
    if(docSess!= null)
    {
      JSONObject message = new JSONObject();
      message.put("type", "switchAutoPublish");
      message.put("user", user.getId());
      message.put("enabled", autoPublish);
      docSess.publishServerMessage(message);
    }
    
    response.setStatus(HttpServletResponse.SC_OK);
  }

}
