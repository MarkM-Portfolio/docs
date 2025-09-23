/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.rest.handlers;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.repository.LCRepositoryTestFactory;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocsAPITestHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(DocsAPITestHandler.class.getName());

  public static final String ITEMS = "items";

  private static DocumentType type = DocumentType.TEXT;

  private static final String SIDE = "side";

  private static final String LCFILES = "lcfiles";

  public enum DocumentType {
    TEXT("text"), SHEET("sheet"), PRES("pres");

    private String type;

    DocumentType(String type)
    {
      this.type = type;
    }

    public String toString()
    {
      return type;
    }
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    if (!isEnvironmentValid())
    {
      LOG.log(Level.WARNING, "It is the local environment and does not support integration test with inactive side Connections Files.");
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    // https://apps.xxx.com/docs/api/testapi?side=A
    String side = request.getParameter(SIDE);
    // if (side == null)
    // {
    // LOG.log(Level.WARNING, "The request url missed side parameter.");
    // ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
    // return;
    // }

    boolean initiated = LCRepositoryTestFactory.initCMISRepository(user, side);
    if (!initiated)
    {
      LOG.log(Level.WARNING, "The repository can not be initiated successfully using new server_url configuration.");
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    /*
     * Sample: { "items": [ { "id" : "createFileTestCase", "desc" : "Create a file on inactive Connections Files", "isSuccess" : "true",
     * "message" : "Successfully create a file on inactive Connections Files" }, { "id" : "testUploadFileTestCase", "desc" :
     * "Upload a file to inactive Connection Files", "isSuccess" : "true", "message" :
     * "Successfully upload a file to inactive Connections Files" } ] }
     */
    JSONObject result = new JSONObject();
    JSONArray array = new JSONArray();
    result.put(ITEMS, array);
    // Create a 0 size .xlsx file
    JSONObject item = LCRepositoryTestFactory.testCreateFile(DocumentType.SHEET);
    array.add(item);
    // Create a 0 size .docx file
    item = LCRepositoryTestFactory.testCreateFile(type);
    array.add(item);
    String docUri = (String) item.get(LCRepositoryTestFactory.DOC_RUI);
    if (docUri != null)
    {
      array.add(LCRepositoryTestFactory.testRenameFile(type));
      array.add(LCRepositoryTestFactory.testLockFile());
      array.add(LCRepositoryTestFactory.testUnlockFile());
      array.add(LCRepositoryTestFactory.testGetDocument());
      array.add(LCRepositoryTestFactory.testGetAllACE());
      array.add(LCRepositoryTestFactory.testSetContentStream());
      array.add(LCRepositoryTestFactory.testGetContentStream());
      array.add(LCRepositoryTestFactory.testGetVersions());
      // array.add(LCRepositoryTestFactory.testDeleteFile());
    }
    array.add(LCRepositoryTestFactory.testSametimeProfile());
    array.add(LCRepositoryTestFactory.testSametimeBIZCard());

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    result.serialize(response.getWriter(), true);

  }

  private boolean isEnvironmentValid()
  {
    IRepositoryAdapter repoAdapter = RepositoryServiceUtil.getRepositoryAdapter(LCFILES);
    boolean isValid = (repoAdapter != null);
    LOG.log(Level.INFO, "Is the Docs API test environment valid? " + isValid);
    return isValid;
  }
}
