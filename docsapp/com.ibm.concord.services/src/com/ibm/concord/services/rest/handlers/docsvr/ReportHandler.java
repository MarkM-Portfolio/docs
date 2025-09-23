/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.WASConfigHelper;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
public class ReportHandler implements PostHandler
{
  private static final long serialVersionUID = 1L;
  
  private static final Logger LOG = Logger.getLogger(ReportHandler.class.getName());

  private static final SimpleDateFormat format = new SimpleDateFormat("_M_d_Hms");
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    try{     
      Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
      String repoId = pathMatcher.group(1);
      String uri = pathMatcher.group(2);
      UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
      
      IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      
      if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
      {
        return;
      }
      
      String installRoot = WASConfigHelper.getCellVariable("DOCS_INSTALL_ROOT");
      if (installRoot != null)
      {
        installRoot = resolve(installRoot);
        String url = installRoot + File.separator + "logs/report";
        File folder = new File(url);
        if (!folder.exists())
        {
          folder.mkdirs();
        }       
        url = url + File.separator + uri+  format.format(new Date()) + "_user" + user.getId();
        
        File report = new File(url);
        if (report.exists())
        {
          report.delete();
        }
        
        String ua = request.getHeader("User-Agent");
        JSONArray msgs = JSONArray.parse(request.getReader());        
        
        StringBuffer buffer = new StringBuffer();
        buffer.append(user.getId());
        buffer.append("\r\n");
        buffer.append(ua);
        buffer.append("\r\n");
        for (int index = 0; index < msgs.size(); index++)
        {
          buffer.append(msgs.get(index).toString());
          buffer.append("\r\n");
        }
        FileUtil.writeFile(buffer.toString(), url);
      }      
    }
    catch(Exception e)
    {
      LOG.log(Level.WARNING, "Can not create report!", e);
    }

  }
  
  private String resolve(String path)
  {
    if(File.separatorChar == '\\')
    {
      if(path.indexOf('/') != -1)
      {
        path = path.replace('/', '\\');
      }
      if(path.endsWith("\\"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    else
    {
      if(path.endsWith("/"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    return path;
  }
}
