/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.repository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.input.AutoCloseInputStream;
import org.apache.zookeeper.KeeperException;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.lc3.util.HttpClientInvoker;
import com.ibm.concord.platform.notification.EmailNoticeComponentImpl;
import com.ibm.concord.services.rest.handlers.DocsAPITestHandler.DocumentType;
import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.files.LCFilesCMISRepository;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.lotusLive.registry.RegistryParser;
import com.ibm.lotusLive.registry.SettingNotFoundException;
import com.ibm.zookeeper.client.InvalidTopologyException;
import com.ibm.zookeeper.client.ZooKeeperClient;

public class LCRepositoryTestFactory
{
  private static final Logger LOG = Logger.getLogger(LCRepositoryTestFactory.class.getName());

  private static final String ID = "id";

  private static final String DESC = "desc";

  private static final String IS_SUCCESS = "isSuccess";

  private static final String MESSAGE = "message";

  private static final String COMPONENT_KEY = "component";

  private static final String COMPONENT_LIST_KEY = "components";

  private static final String COMPONENT_CONFIG_KEY = "config";

  private static LCFilesCMISRepository repository = new LCFilesCMISRepository();

  private static RegistryParser registryParser = new RegistryParser();

  private static IDocumentEntry docEntry;

  private static UserBean user;

  private static HttpClientInvoker invoker;

  private static String connDomainPort;

  private static String vip;

  public static final String DOC_RUI = "docUri";

  private enum ActionType {
    CREATE("create"), LOCK("lock"), UNLOCK("unlock"), RENAME("rename"), GETALLACE("getAllACE"), GETALLVERIONS("getVersions"), DELETE(
        "delete"), SETCONTENTSTREAM("setContentStream"), GETCONTENTSTREAM("getContentStream"), GETDOCUMENT("getDocument"), STPROFILE(
        "getProfile"), STBIZCARD("getBIZCard");

    private String type;

    ActionType(String type)
    {
      this.type = type;
    }

    public String toString()
    {
      return type;
    }
  }

  public static boolean initCMISRepository(UserBean caller, String side)
  {
    user = caller;
    JSONObject componentConfig = ConcordConfig.getInstance().getSubConfig(COMPONENT_KEY);
    JSONArray array = (JSONArray) componentConfig.get(COMPONENT_LIST_KEY);
    for (int i = 0; i < array.size(); i++)
    {
      JSONObject obj = (JSONObject) array.get(i);
      String id = (String) obj.get(ID);
      if (RepositoryComponent.COMPONENT_ID.equals(id))
      {
        JSONObject config = (JSONObject) obj.get(COMPONENT_CONFIG_KEY);
        JSONArray adapters = (JSONArray) config.get("adapters");
        for (int j = 0; j < adapters.size(); j++)
        {
          JSONObject adapterConfig = (JSONObject) adapters.get(j);
          String repoid = (String) adapterConfig.get("id");
          if ("lcfiles".equals(repoid))
          {
            JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
            JSONObject newConfig = getCustomizedConfig4Repository(providerConfig, side);
            if (newConfig == null)
              return false;
            newConfig.put("id", repoid);
            repository.init(newConfig);
            invoker = new HttpClientInvoker(newConfig);
            break;
          }
        }
      }
      else if (EmailNoticeComponentImpl.COMPONENT_ID.equals(id))
      {
        JSONObject config = (JSONObject) obj.get(COMPONENT_CONFIG_KEY);
        JSONArray adapters = (JSONArray) config.get("adapters");
        JSONObject adapterConfig = (JSONObject) adapters.get(0);
        if (adapterConfig != null)
        {
          JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
          try
          {
            String serverlUrl = (String) providerConfig.get("server_url");
            URL url = new URL(serverlUrl);
            connDomainPort = String.valueOf(url.getPort());
            LOG.log(Level.INFO, "The Common port of the given side Connections is " + connDomainPort);
          }
          catch (MalformedURLException e)
          {
            LOG.log(Level.SEVERE, "Illegal URL string when perform initialization of class", e);
          }
        }
      }
      else
      {
        continue;
      }
    }
    return true;
  }

  private static JSONObject getCustomizedConfig4Repository(JSONObject providerConfig, String side)
  {
    StringBuffer acBuffer = new StringBuffer();
    acBuffer.append(registryParser.getBaseTopologyName());
    if (side != null)
    {
      acBuffer.append(side);
    }
    try
    {
      ZooKeeperClient client = new ZooKeeperClient();
      try
      {
        if (side != null)
        {
          vip = client.getBackEndVIP("/topology/ac/vip", acBuffer.toString());
        }
        else
        {
          vip = client.getBackEndVIP("/topology/ac/vip");
        }
      }
      catch (KeeperException e1)
      {
        LOG.log(Level.WARNING, "Error happened when getting Connections backend vip", e1);
        vip = null;
      }
      catch (InterruptedException e1)
      {
        LOG.log(Level.WARNING, "Error happened when getting Connections backend vip", e1);
        vip = null;
      }
      catch (InvalidTopologyException e1)
      {
        LOG.log(Level.WARNING, "Error happened when getting Connections backend vip", e1);
        vip = null;
      }

      if (vip != null)
      {
        LOG.log(Level.INFO, "The domain of the given side Connections is " + vip);
        try
        {
          String serverlUrl = (String) providerConfig.get("server_url");
          URL url = new URL(serverlUrl);
          String port = String.valueOf(url.getPort());
          StringBuffer sb = new StringBuffer();
          sb.append("http://").append(vip).append(":").append(port).append("/files");
          LOG.log(Level.INFO, "The url of the given side Connections is " + sb.toString());
          providerConfig.put("server_url", sb.toString());
          return providerConfig;
        }
        catch (MalformedURLException e)
        {
          LOG.log(Level.SEVERE, "Illegal URL string when perform initialization of class", e);
        }
      }
      client.close();
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "IO error for ", e);
    }
    catch (SettingNotFoundException e)
    {
      LOG.log(Level.WARNING, "Zookeeper: Could not settings from registry parser", e);
    }
    return null;
  }

  public static JSONObject testCreateFile(DocumentType type)
  {
    JSONObject item = new JSONObject();
    try
    {
      // Fork data information to post to Connections Files
      StringBuffer tbf = new StringBuffer("apitest_title_");
      tbf.append(UUID.randomUUID().toString()).append(getExtension(type));
      String raw_doc_title = tbf.toString();

      String title = new String(raw_doc_title.getBytes("ISO-8859-1"), "UTF-8");
      boolean isExternal = MediaDescriptor.DEFAULT_IS_EXTERNAL_VALUE;
      boolean propagate = MediaDescriptor.DEFAULT_PROPAGATE_VALUE;
      String contextType = "";
      String contextValue = "";
      String fVisibility = "public";
      InputStream empty_is = new ByteArrayInputStream(new byte[0]);

      doCommonConfig(item, ActionType.CREATE);

      // caller, caller.getId(), "personalFiles", media.getTitle(), media.getStream(), media.getIsExternal(), media.getPropagate(),
      // media.getOptions()
      MediaOptions options = new MediaOptions(contextType, contextValue, fVisibility);
      docEntry = repository.createDocument(user, user.getId(), "personalFiles", title, empty_is, isExternal, propagate, options);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Failed to create the document, document type: {0}.", new Object[] { type });
        item.put(IS_SUCCESS, "false");
        item.put(MESSAGE, "Failed to create the document because the return docEntry is null.");
        return item;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, e.getErrMsg(), e);
      item.put(IS_SUCCESS, "false");
      if (e.getErrCode() == RepositoryAccessException.EC_REPO_OUT_OF_SPACE)
      {
        item.put(MESSAGE, "Failed to create the document because repository is out of space.");
      }
      else if (e.getErrCode() == RepositoryAccessException.EC_REPO_DUPLICATED_TITLE)
      {
        item.put(MESSAGE, "Failed to create the document because there is a file with duplicated title.");
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to create the document, document type: {0}. Exception: {1}", new Object[] { type, e });
        item.put(MESSAGE, "Failed to create the document because repository access exception occurs: " + e);
      }
      return item;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error creating document type: " + type, e);
      item.put(IS_SUCCESS, "false");
      item.put(MESSAGE, "Failed to create the document because exception occurs: " + e);
      return item;
    }

    item.put(IS_SUCCESS, "true");
    item.put(DOC_RUI, docEntry.getDocUri());
    item.put(MESSAGE, "Successfully create a file on Connections Files & document type is:" + type);
    return item;
  }

  /**
   * To test lock a file
   * 
   * @param user
   * @param docEntry
   * @return whether or not lock the file successfully
   */
  public static JSONObject testLockFile()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.LOCK);
    try
    {
      repository.lockDocument(user, docEntry);
      doSuccessConfig(item, ActionType.LOCK, null);
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.LOCK, docEntry.getDocUri(), e);
    }
    return item;
  }

  /**
   * To test unlock a file
   * 
   * @return whether or not unlock the file successfully
   */
  public static JSONObject testUnlockFile()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.UNLOCK);
    try
    {
      repository.unlockDocument(user, docEntry);
      doSuccessConfig(item, ActionType.UNLOCK, null);
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.UNLOCK, docEntry.getDocUri(), e);
    }
    return item;
  }

  /**
   * To test rename a file
   * 
   * @return whether or not rename the file successfully
   */
  public static JSONObject testRenameFile(DocumentType type)
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.RENAME);
    try
    {
      StringBuffer tbf = new StringBuffer("apitest_renamedtitle_");
      tbf.append(UUID.randomUUID().toString()).append(getExtension(type));
      String raw_doc_title = tbf.toString();
      String title = new String(raw_doc_title.getBytes("ISO-8859-1"), "UTF-8");
      repository.renameDocument(user, docEntry, title);
      doSuccessConfig(item, ActionType.RENAME, " and file had been renamed to " + title);
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.RENAME, docEntry.getDocUri(), e);
    }
    catch (Exception e)
    {
      doFailureConfig(item, ActionType.RENAME, docEntry.getDocUri(), e);
    }
    return item;
  }

  /**
   * To test getContentStream of a file
   * 
   * @return whether or not testGetContentStream the file successfully
   */
  public static JSONObject testSetContentStream()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.SETCONTENTSTREAM);
    try
    {
      InputStream is = getFileContent();
      String errorMsg = " because it could not get the sample file's content.";
      if (is != null)
      {
        IDocumentEntry entry = repository.setContentStream(user, docEntry, is, null);
        if (entry != null)
        {
          long before = docEntry.getModified().getTime().getTime();
          long after = entry.getModified().getTime().getTime();
          if (after > before)
          {
            doSuccessConfig(item, ActionType.SETCONTENTSTREAM, " and the modified timestamp was " + after);
            return item;
          }
          errorMsg = " because the lastModified timestamp was not updated.";
        }
        errorMsg = " because the returned entry was null.";
      }
      doFailureConfig(item, ActionType.SETCONTENTSTREAM, docEntry.getDocUri(), errorMsg);
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.SETCONTENTSTREAM, docEntry.getDocUri(), e);
    }
    return item;
  }

  private static InputStream getFileContent()
  {
    try
    {
      InputStream docStream = new AutoCloseInputStream(
          LCRepositoryTestFactory.class.getResourceAsStream("/com/ibm/concord/services/repository/test.docx"));
      return docStream;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Failed to get content from the sample file. {0}", new Object[] { e });
      return null;
    }
  }

  /**
   * To test getContentStream of a file
   * 
   * @return whether or not testGetContentStream the file successfully
   */
  public static JSONObject testGetContentStream()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.GETCONTENTSTREAM);
    try
    {
      InputStream in = repository.getContentStream(user, docEntry);
      if (in != null)
      {
        doSuccessConfig(item, ActionType.GETCONTENTSTREAM, " and got the content of the file -" + docEntry.getDocUri());
        return item;
      }
      doFailureConfig(item, ActionType.GETCONTENTSTREAM, docEntry.getDocUri(), " because it could not get the content.");
    }
    catch (Exception e)
    {
      doFailureConfig(item, ActionType.GETCONTENTSTREAM, docEntry.getDocUri(), e);
    }
    return item;
  }

  /**
   * To test getVersions of a file
   * 
   * @return whether or not getVersions the given file successfully
   */
  public static JSONObject testGetVersions()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.GETALLVERIONS);
    try
    {
      IDocumentEntry[] result = repository.getVersions(user, docEntry);
      if (result.length != 0)
      {
        doSuccessConfig(item, ActionType.GETALLVERIONS, null);
      }
      else
      {
        doFailureConfig(item, ActionType.GETALLVERIONS, docEntry.getDocUri(), " because the returned documentEntry array was empty");
      }
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.GETALLVERIONS, docEntry.getDocUri(), e);
    }
    return item;
  }

  /**
   * To test getAllACE of a file
   * 
   * @return whether or not getAllACE the given file successfully
   */
  public static JSONObject testGetAllACE()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.GETALLACE);
    try
    {
      Vector<ACE> result = repository.getAllACE(user, docEntry);
      if (result.size() != 0)
      {
        doSuccessConfig(item, ActionType.GETALLACE, " and result was: " + result.get(0).toString());
      }
      else
      {
        doFailureConfig(item, ActionType.GETALLACE, docEntry.getDocUri(), " because it could not get ACE of the file");
      }
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.GETALLACE, docEntry.getDocUri(), e);
    }
    return item;
  }

  /**
   * To test getDocument of the given file
   * 
   * @return whether or not getDocument of the given file successfully
   */
  public static JSONObject testGetDocument()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.GETDOCUMENT);
    try
    {
      IDocumentEntry entry = repository.getDocument(user, docEntry.getDocUri());
      if (entry != null)
      {
        doSuccessConfig(item, ActionType.GETDOCUMENT, " and it got the document entry due to the file id.");
      }
      else
      {
        doFailureConfig(item, ActionType.GETDOCUMENT, docEntry.getDocUri(), " because it could not get document entry.");
      }
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.GETDOCUMENT, docEntry.getDocUri(), e);
    }
    return item;
  }

  /**
   * To test delete a file
   * 
   * @return whether or not delete the file successfully
   */
  public static JSONObject testDeleteFile()
  {
    JSONObject item = new JSONObject();
    doCommonConfig(item, ActionType.DELETE);
    try
    {
      repository.deleteDocument(user, docEntry.getDocUri());
      doSuccessConfig(item, ActionType.DELETE, " and the file had been moved to trash.");
    }
    catch (RepositoryAccessException e)
    {
      doFailureConfig(item, ActionType.DELETE, docEntry.getDocUri(), e);
    }
    return item;
  }

  public static JSONObject testSametimeProfile()
  {
    StringBuffer sb = new StringBuffer();
    sb.append("http://").append(vip).append(":").append(connDomainPort).append("/connections/opensocial/rest/people/@me/@self");
    return testSametimeCase(sb.toString(), ActionType.STPROFILE);
  }

  public static JSONObject testSametimeBIZCard()
  {
    StringBuffer sb = new StringBuffer();
    sb.append("http://").append(vip).append(":").append(connDomainPort)
        .append("/connections/resources/web/_js/?include=lconn.core.people&exclude=dojo.i18n&debug=true&lang=en");
    return testSametimeCase(sb.toString(), ActionType.STBIZCARD);
  }

  private static JSONObject testSametimeCase(String url, ActionType type)
  {
    JSONObject item = new JSONObject();
    StringBuffer sb = new StringBuffer();
    item.put(ID, sb.append(type.toString()).append("_TestCase").append("_").append(new Date().getTime()).toString());
    sb = new StringBuffer();
    item.put(DESC, sb.append("To verify whether we can ").append(type.toString()).append(" from Connections for sametime integration.")
        .toString());
    try
    {
      sb = new StringBuffer();
      if (invoker.testGetMessage(user, url))
      {
        item.put(IS_SUCCESS, "true");
        item.put(MESSAGE, sb.append("Successfully executed action - ").append(type.toString()).toString());
      }
      else
      {
        item.put(IS_SUCCESS, "false");
        item.put(MESSAGE, sb.append("Failed to execute action - ").append(type.toString()).toString());
      }
      return item;
    }
    catch (AccessException e)
    {
      LOG.log(Level.SEVERE, "Failed to get content from Connections for action - " + type.toString() + " because of " + e);
      item.put(IS_SUCCESS, "false");
      item.put(MESSAGE, sb.append("Failed to execute action - ").append(type.toString()).append(" because of ").append(e.getMessage())
          .toString());
      return item;
    }
  }

  private static JSONObject doCommonConfig(JSONObject item, ActionType type)
  {
    StringBuffer sb = new StringBuffer();
    item.put(ID, sb.append(type.toString()).append("_FileTestCase").append("_").append(new Date().getTime()).toString());
    sb = new StringBuffer();
    item.put(DESC, sb.append("To ").append(type.toString()).append(" a file on Connections Files").toString());
    return item;
  }

  private static JSONObject doSuccessConfig(JSONObject item, ActionType type, String message)
  {
    item.put(IS_SUCCESS, "true");
    StringBuffer sb = new StringBuffer();
    item.put(MESSAGE, sb.append("Successfully executed action - ").append(type.toString()).append(message != null ? message : "")
        .toString());
    return item;
  }

  private static JSONObject doFailureConfig(JSONObject item, ActionType type, String docUri, Exception e)
  {
    LOG.log(Level.WARNING, "Failed to {0} the document, docUri: {1}. Exception: {2}", new Object[] { type.toString(), docUri, e });
    item.put(IS_SUCCESS, "false");
    StringBuffer sb = new StringBuffer();
    item.put(
        MESSAGE,
        sb.append("Failed to execute action - ").append(type.toString()).append(" because repository access exception occurred: ")
            .append(e.getMessage()).toString());
    return item;
  }

  private static JSONObject doFailureConfig(JSONObject item, ActionType type, String docUri, String cause)
  {
    LOG.log(Level.WARNING, "Failed to {0} the document, docUri: {1}", new Object[] { type.toString(), docUri });
    item.put(IS_SUCCESS, "false");
    StringBuffer sb = new StringBuffer();
    item.put(MESSAGE, sb.append("Failed to execute action - ").append(type.toString()).append(cause).toString());
    return item;
  }

  private static String getExtension(DocumentType type)
  {
    if (DocumentType.TEXT.equals(type))
    {
      return ".docx";
    }
    else if (DocumentType.SHEET.equals(type))
    {
      return ".xlsx";
    }
    else if (DocumentType.PRES.equals(type))
    {
      return ".pptx";
    }
    return ".docx";
  }
}
