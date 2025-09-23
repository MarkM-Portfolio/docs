/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.tasks;

import java.io.File;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.docs.framework.IComponent;
import com.ibm.json.java.JSONObject;

public class UpgradeDocumentHistoryDBTask implements IMigrationTask
{

  private static final Logger LOG = Logger.getLogger(UpgradeDocumentHistoryDBTask.class.getName());

  private static final String FILES_REPOSITORY = "lcfiles";

  private static final Pattern FILES_ID_PATTERN = Pattern.compile("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");

  @Override
  public MigrationTaskContext check(File orgHome, File draftHome)
  {
    LOG.entering(this.getClass().getName(), "check", new Object[] { draftHome.getPath() });
    boolean needUpgrade = false;
    try
    {
      // check document history
      IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
      IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
      // only need to deal with it for Files integration.
      // TODO: need to change when Docs integrate with new repository.
      DocHistoryBean docHistoryBean = docHisotryDAO.get(FILES_REPOSITORY, draftHome.getName());
      // check draft status
      DraftDescriptor dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(orgHome.getParentFile().getName(),
          FILES_REPOSITORY, draftHome.getName());
      boolean draftExisted = DraftStorageManager.getDraftStorageManager().isDraftExisted(dd);
      if (docHistoryBean == null)
      {
        docHistoryBean = new DocHistoryBean(FILES_REPOSITORY, draftHome.getName());
        docHistoryBean.setOrgId(orgHome.getParentFile().getName());
        if (draftExisted)
        {
          JSONObject meta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
          String repositoryId = (String) meta.get(DraftMetaEnum.REPOSITORY_ID.getMetaKey());
          if (FILES_REPOSITORY.equals(repositoryId))
          {
            // new document without publish case
            LOG.log(Level.WARNING, "draft: " + draftHome.getPath() + " is created by HCL Docs without publish, need to add to data base.");
            docHistoryBean.setLastModified(DocHistoryBean.NEW_DOCUMENT_WITHOUT_PUBLISH_STATUS);
            docHisotryDAO.add(docHistoryBean);
          }
        }
        else
        {
          Matcher matcher = FILES_ID_PATTERN.matcher(draftHome.getName());
          if ((matcher != null) && matcher.matches())
          {
            File uploadConvertFolder = new File(draftHome + IDraftStorageAdapter.separator + "temp" + IDraftStorageAdapter.separator
                + "upload");
            if (uploadConvertFolder.exists())
            {
              // upload document without edit case
              LOG.log(Level.WARNING, "draft: " + draftHome.getPath()
                  + " is an upload document without HCL Docs editing, need to add to data base.");
              docHistoryBean.setLastModified(DocHistoryBean.UPLOAD_DOCUMENT_WITHOUT_EDIT_STATUS);
              docHisotryDAO.add(docHistoryBean);
            }
          }
        }
      }
      else
      {
        String dbOrgId = docHistoryBean.getOrgId();
        // has been transferred before
        if (!dbOrgId.equals(orgHome.getParentFile().getName()) && draftExisted)
        {
          LOG.log(Level.WARNING, "draft: " + draftHome.getPath() + " has org tranfer issue, need to try to fix it automatically.");
          DraftDescriptor dd2 = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(dbOrgId, FILES_REPOSITORY,
              draftHome.getName());
          boolean draftExisted2 = DraftStorageManager.getDraftStorageManager().isDraftExisted(dd2);
          boolean draftDirty = DraftStorageManager.getDraftStorageManager().isDraftDirty(dd);
          if (draftExisted2)
          {
            boolean draftDirty2 = DraftStorageManager.getDraftStorageManager().isDraftDirty(dd2);
            if (!draftDirty2)
            {
              JSONObject meta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
              JSONObject meta2 = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd2);
              long lastModified = ((Calendar) meta.get(DraftMetaEnum.LAST_MODIFIED)).getTimeInMillis();
              long lastModified2 = ((Calendar) meta2.get(DraftMetaEnum.LAST_MODIFIED)).getTimeInMillis();
              if (draftDirty && (lastModified == lastModified2))
              {
                // need to transfer again
                LOG.log(Level.WARNING, "old draft: " + draftHome.getPath()
                    + " is dirty, but new draft is not dirty, need to fix org tranfer issue.");
                DraftStorageManager.getDraftStorageManager().discardDraft(dd2);
                docHistoryBean.setOrgId(orgHome.getParentFile().getName());
                docHistoryBean.setLastModified(DocHistoryBean.TRANSFER_FAILED_WITH_OLD_DIRTY_DRAFT_STATUS);
                docHisotryDAO.update(docHistoryBean);
              }
              else
              {
                LOG.log(Level.WARNING, "old draft: " + draftHome.getPath()
                    + " is not dirty, or old draft and new draft are different versions, can't fix org tranfer issue.");
              }
            }
            else
            {
              LOG.log(Level.WARNING, "Both old draft and new draft are dirty, can't fix org tranfer issue.");
            }
          }
          else
          {
            if (draftDirty)
            {
              // need to transfer again
              LOG.log(Level.WARNING, "old draft: " + draftHome.getPath()
                  + " is dirty and new draft does not exist, need to fix org tranfer issue.");
              docHistoryBean.setOrgId(orgHome.getParentFile().getName());
              docHistoryBean.setLastModified(DocHistoryBean.TRANSFER_FAILED_WITHOUT_NEW_DRAFT_STATUS);
              docHisotryDAO.update(docHistoryBean);
            }
            else
            {
              LOG.log(Level.INFO, "old draft: " + draftHome.getPath() + " is not dirty, no need to fix org tranfer issue.");
            }
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to check file " + draftHome.getPath(), e);
    }

    LOG.exiting(this.getClass().getName(), "check", new Object[] { draftHome.getPath(), needUpgrade });
    return null;
  }

  @Override
  public boolean migrate(MigrationTaskContext context) throws Exception
  {
    // do nothing for this type of task.
    return true;
  }
}