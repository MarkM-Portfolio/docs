/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.job;

import java.io.File;
import java.io.FileInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class JobHandler implements GetHandler
{
  private static final Logger LOGGER = Logger.getLogger(JobHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    String jobId = pathMatcher.group(3);
    
    String workingDirPath = JobUtil.getDefaultWorkingDir(user.getCustomerId(), docUri, jobId);
    File workingDir = new File(workingDirPath);
    if (workingDir.exists())
    {
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");

      if (Job.isFinished(workingDir, jobId))
      {
        JobExecutionException e = Job.getError(workingDir);
        if (e == null)
        {
          if (Job.getResultFile(workingDir).exists())
          {
            JSONObject json = new JSONObject();
            json.put("id", jobId);
            json.put("status", "complete");
            String mode = request.getParameter("mode");
            String draft = request.getParameter("draft");
            JSONObject docEntryInJSON = null;
            if (Job.getResultFile(workingDir).getName().equals(Job.RESULT + Job.ENTRY_RESULT_SUFFIX))
            {
              File resultFile = Job.getResultFile(workingDir);
              docEntryInJSON = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(resultFile)));
//              IDocumentEntry newDocEntry = DocumentEntryHelper.fromJSON(docEntryInJSON);
//              repoId = newDocEntry.getRepository();
//              docUri = newDocEntry.getDocUri();
              json.put("data", docEntryInJSON);
            }
            
//            if ("view".equalsIgnoreCase(mode))
//            {
//              if (Boolean.valueOf(draft))
//              {
//                json.put("data", URLConfig.getContextPath() + "/app/doc/" + repoId + "/" + docUri + "/view/draft/content");
//              }
//              else
//              {
//                json.put("data", URLConfig.getContextPath() + "/app/doc/" + repoId + "/" + docUri + "/view/content");
//              }
//            }
//            else
//            {
//              json.put("data", URLConfig.getContextPath() + "/app/doc/" + repoId + "/" + docUri + "/edit/content");
//            }
            
            json.serialize(response.getWriter(), true);
          }
          else
          {
            JSONObject json = new JSONObject();
            json.put("id", jobId);
            json.put("status", "error");
            json.put("error_code", "JOB FAKE FINISHED");
            json.put("error_msg", "FAKE FINISHED JOB DETECTED.");
            json.serialize(response.getWriter(), true);

            LOGGER.log(Level.WARNING, "FAKE FINISHED JOB DETECTED: " + jobId);
          }
        }
        else
        {
          JSONObject json = new JSONObject();
          json.put("id", jobId);
          json.put("status", "error");
          json.put("error_code", e.getErrorCode());
          json.put("error_msg", e.getErrorMsg());
          JSONObject data = e.getData();
          if(data != null)
          {
            data.put("jobId", jobId);
            json.put("data", data);
            
            String responseID = (String) data.get(HttpSettingsUtil.RESPONSE_ID);
            LOGGER.info(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "Error response id from conversion %s .", new Object[] { responseID })).toString());
          }
          json.serialize(response.getWriter(), true);
        }
      }
      else if (Job.isBroken(workingDir, jobId))
      {
        JSONObject json = new JSONObject();
        json.put("id", jobId);
        json.put("status", "broken");
        json.serialize(response.getWriter(), true);
      }
      else
      {
        JSONObject json = new JSONObject();
        json.put("id", jobId);
        json.put("status", "pending");
        json.serialize(response.getWriter(), true);
      }
    }
    else
    {
      LOGGER.log(Level.WARNING, "Did not find the work path {0}.",  workingDirPath);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }
  }
}
