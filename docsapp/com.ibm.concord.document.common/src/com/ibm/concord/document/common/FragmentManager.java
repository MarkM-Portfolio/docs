/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common;

import java.util.List;
import java.util.Set;

import com.ibm.concord.document.services.AttachmentsUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocReferenceBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocReferenceDAO;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class FragmentManager
{

  private static FragmentManager instance = null;

  public void addDocReference(UserBean caller, String parentRepo, String parentUri, String childRepo, String childUri, String taskId)
  {
    IDocReferenceDAO docRefDAO = getDocReferenceDAO();
    DocReferenceBean bean = new DocReferenceBean();
    bean.setParentRepository(parentRepo);
    bean.setParentUri(parentUri);
    bean.setChildRepository(childRepo);
    bean.setChildUri(childUri);
    bean.setTaskid(taskId);

    docRefDAO.add(caller, bean);
  }

  public void removeDocReference(UserBean caller, String parentRepo, String parentUri, String childRepo, String childUri)
  {
    IDocReferenceDAO docRefDAO = getDocReferenceDAO();
    docRefDAO.delete(parentRepo, parentUri, childRepo, childUri);
  }

  public void submitFragment(UserBean caller, IDocumentEntry fragDoc)
  {
    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSession(fragDoc);
    if (docSess == null)
    {
      try
      {
        docSess = mgr.openSession(caller, fragDoc);
      }
      catch (Exception e)
      {
        e.printStackTrace();
        return;
      }
    }

    try
    {
      JSONObject state = docSess.getCurrentState(null);
      JSONObject content = (JSONObject) state.get(MessageConstants.CONTENT_STATE_KEY);
      String strHTML = (String) content.get("html");

      // get new html then put it back
      String newHTML = DocumentServiceUtil.getSubmittedContent(fragDoc, strHTML);
      content.put("html", newHTML);

      List<DocReferenceBean> parentRefList = getParentReference(caller, fragDoc.getRepository(), fragDoc.getDocUri());
      for (int i = 0; i < parentRefList.size(); i++)
      {
        DocReferenceBean p = parentRefList.get(i);
        try
        {
          IDocumentEntry parentDoc = DocumentEntryUtil.getEntry(caller, p.getParentRepository(), p.getParentUri(), true);
          Set<Permission> permissions = parentDoc.getPermission();
          if (Permission.EDIT.hasPermission(permissions))
          {
            updateFragment(caller, fragDoc, parentDoc, state);
          }
        }
        catch (Throwable e)
        {
          e.printStackTrace();
        }
      }
    }
    catch (ConcordException e)
    {
      e.printStackTrace();
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  public List<DocReferenceBean> getParentReference(UserBean caller, String childRepo, String childUri)
  {
    IDocReferenceDAO docRefDAO = getDocReferenceDAO();
    List<DocReferenceBean> parents = docRefDAO.getByChild(childRepo, childUri);
    return parents;
  }

  private void handleImage(UserBean caller, IDocumentEntry fragDoc, IDocumentEntry refDoc, JSONObject content)
  {
    // update image link
    JSONObject contentJson = (JSONObject) content.get("content");
    String docStr = (String) contentJson.get("html");
    contentJson.put("html", docStr.replaceAll(fragDoc.getDocUri(), refDoc.getDocUri()));

    // copy all images to new document
    try
    {
      AttachmentsUtil.copyAllDraftAttachments(caller, refDoc, fragDoc);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  private void updateFragment(UserBean caller, IDocumentEntry fragDoc, IDocumentEntry refDoc, JSONObject content)
  {
    // update image link and copy image to storage
    // update image link and copy image to storage
    String docType = DocumentServiceUtil.getDocumentType(fragDoc);

    if (docType.equalsIgnoreCase("text"))
      handleImage(caller, fragDoc, refDoc, content);

    // update fragment
    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSession(refDoc);
    if (docSess == null)
    {
      try
      {
        docSess = mgr.openSession(caller, refDoc);
      }
      catch (Exception e)
      {
        e.printStackTrace();
        return;
      }
    }
    docSess.updateFragment(fragDoc.getRepository() + "/" + fragDoc.getDocUri(), content);
  }

  private FragmentManager()
  {
  }

  private IDocReferenceDAO getDocReferenceDAO()
  {
    return (IDocReferenceDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocReferenceDAO.class);
  }

  public static FragmentManager getInstance()
  {
    if (instance == null)
      instance = new FragmentManager();
    return instance;
  }
}
