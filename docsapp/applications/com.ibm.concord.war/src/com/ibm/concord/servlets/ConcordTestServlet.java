/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.servlets;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class ConcordTestServlet extends HttpServlet
{
  private static final Logger LOG = Logger.getLogger(ConcordTestServlet.class.getName());
  private static final long serialVersionUID = -6063737172133084603L;

  public static final String TEST_SUITE = "suite";
  public static final String FILE_OUTPUT = "outputHTMLFilePath";

  private static List<String> isRunning = new LinkedList<String>();

  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    UserBean user = (UserBean) req.getAttribute(IAuthenticationAdapter.REQUEST_USER);

    Object testRunner = null;
    try
    {
      testRunner = Class.forName("com.ibm.concord.test.internal.TestRunner").newInstance();
    }
    catch (IllegalAccessException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request against a build without \"ut.enabled=true\" build option.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_000");
      json.put("ErrorMsg", "This is an ut.enabled=false build, so that this UT kick off request was rejected.");
      json.serialize(resp.getWriter(), true);
      return;
    }
    catch (InstantiationException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request against a build without \"ut.enabled=true\" build option.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_000");
      json.put("ErrorMsg", "This is an ut.enabled=false build, so that this UT kick off request was rejected.");
      json.serialize(resp.getWriter(), true);
      return;
    }
    catch (ClassNotFoundException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request against a build without \"ut.enabled=true\" build option.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_000");
      json.put("ErrorMsg", "This is an ut.enabled=false build, so that this UT kick off request was rejected.");
      json.serialize(resp.getWriter(), true);
      return;
    }

    String testSuite = req.getParameter(TEST_SUITE);
    if (testSuite == null)
    {
      testSuite = req.getPathInfo();
      if (testSuite != null && testSuite.startsWith("/"))
        testSuite = testSuite.substring(1);
    }

    synchronized (isRunning)
    {
      if (isRunning.contains(testSuite))
      {
        JSONObject json = new JSONObject();
        json.put("ErrorCode", "UT_001");
        json.put("ErrorMsg", "We are serving another UT request now, please hold on until it is completed.");
        json.serialize(resp.getWriter(), true);
        return;
      }
      else
      {
        isRunning.add(testSuite);
      }
    }

    String fileOutput = req.getParameter(FILE_OUTPUT);

    OutputStream os = null;
    FileOutputStream fos = null;

    try
    {
      if (fileOutput != null)
      {
        File output = new File(fileOutput);
        if (!output.exists())
          output.createNewFile();
        os = new FileOutputStream(output);

        StringBuffer resultPath = new StringBuffer(fileOutput.substring(0, fileOutput.indexOf(".")));
        resultPath.append(".txt");
        File resultOutput = new File(resultPath.toString());
        fos = new FileOutputStream(resultOutput);
      }
      else
      {
        String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(".html");
        resp.setContentType(mimeType);
        resp.setCharacterEncoding("UTF-8");

        os = resp.getOutputStream();
      }

      Class<?> testRunnerClass = testRunner.getClass();
      Method run = testRunnerClass.getDeclaredMethod("run", new Class[] { String.class, OutputStream.class, OutputStream.class, UserBean.class });
      run.setAccessible(true);
      // Run the tests and print out the results
      run.invoke(null, testSuite, os, fos, user);
    }
    catch (SecurityException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request failed.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_002");
      json.put("ErrorMsg", "Invoke the UT kick off request failed. " + e.getLocalizedMessage());
      json.serialize(resp.getWriter(), true);
      return;
    }
    catch (NoSuchMethodException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request failed.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_002");
      json.put("ErrorMsg", "Invoke the UT kick off request failed. " + e.getLocalizedMessage());
      json.serialize(resp.getWriter(), true);
    }
    catch (IllegalArgumentException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request failed.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_002");
      json.put("ErrorMsg", "Invoke the UT kick off request failed. " + e.getLocalizedMessage());
      json.serialize(resp.getWriter(), true);
    }
    catch (IllegalAccessException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request failed.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_002");
      json.put("ErrorMsg", "Invoke the UT kick off request failed. " + e.getLocalizedMessage());
      json.serialize(resp.getWriter(), true);
    }
    catch (InvocationTargetException e)
    {
      LOG.log(Level.FINE, "Invoke the UT kick off request failed.", e);
      JSONObject json = new JSONObject();
      json.put("ErrorCode", "UT_002");
      json.put("ErrorMsg", "Invoke the UT kick off request failed. " + e.getLocalizedMessage());
      json.serialize(resp.getWriter(), true);
    }
    finally
    {
      isRunning.remove(testSuite);

      if (os != null)
        os.close();
      if (fos != null)
        fos.close();
    }
    resp.flushBuffer();
  }

  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    doGet(req, resp);
  }
}
