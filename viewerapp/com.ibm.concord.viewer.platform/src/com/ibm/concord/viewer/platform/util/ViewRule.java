package com.ibm.concord.viewer.platform.util;

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.config.HTMLViewConfig;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;

public class ViewRule
{
  private static final Logger logger = Logger.getLogger(ViewRule.class.getName());

  private static String rule;

  public static final String PARAM_USER = "user";

  public static final String PARAM_DOCENTRY = "docentry";

  public static final String PARAM_USER_AGENT = "useragent";

  public static final String PARAM_MODE_COMPACT = "compact";

  public static final String PARAM_CONTENT_PATH = "contentpath";

  public static final String VIEW_RULE_RULE1 = "rule1";

  static
  {
    rule = Platform.getViewerConfig().getViewRule();
    if (rule == null)
    {
      rule = VIEW_RULE_RULE1;
      logger.log(Level.WARNING, "Using default view rule.");
    }
  }

  public static ViewContext getViewContext(Map<String, Object> params) throws Exception
  {
    logger.entering(ViewRule.class.getName(), "getViewContext", params.keySet().toArray());

    IDocumentEntry entry = (IDocumentEntry) params.get(PARAM_DOCENTRY);
    String agent = (String) params.get(PARAM_USER_AGENT);
    Boolean compact = (Boolean) params.get(PARAM_MODE_COMPACT);
    UserBean user = (UserBean) params.get(PARAM_USER);
    if (VIEW_RULE_RULE1.equalsIgnoreCase(rule))
    {
      String docMimeType = entry.getMimeType();
      String reposid = entry.getRepository();
      boolean isPwdProtected = entry.getPwdProtected();

      boolean isiNotesRequest = reposid.equals(RepositoryServiceUtil.TEMP_STORAGE_REPO_ID);
      boolean isVerseMailRequest = reposid.equals(RepositoryServiceUtil.MAIL_REPO_ID);
      boolean isVerseLinkRequest = reposid.equals(RepositoryServiceUtil.VSFILES_REPO_ID);
      boolean isVerseRequest = isVerseMailRequest || isVerseLinkRequest;
      String repoType = RepositoryServiceUtil.getRepoTypeFromId(reposid);
      boolean isThirdPartyRequest = repoType.equals(RepositoryServiceUtil.EXTERNAL_CMIS_REPO_TYPE)
          || repoType.equals(RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE);
      boolean isViewOnly = DocumentTypeUtils.isViewOnly(docMimeType, entry.getExtension());
      boolean notUseSSRequests = isiNotesRequest || isVerseRequest || isThirdPartyRequest || isViewOnly || isPwdProtected;

      boolean isIE8 = (agent != null && ViewerUtil.isIE8(agent));
      boolean isIE9 = (agent != null && ViewerUtil.isIE9(agent));
      String contentPath = (String) params.get(PARAM_CONTENT_PATH);
      boolean bNoCache = contentPath != null && contentPath.equalsIgnoreCase("content");

      logger.log(Level.FINER, "compact={0}, contentPath={1}, isViewerNextRequest={2}, isIE8={3}, isIE9={4}, docMimeType={5}", new Object[] {
          compact, contentPath, isVerseRequest, isIE8, isIE9, docMimeType });

      if ((docMimeType == null && (isVerseMailRequest || isiNotesRequest) && HTMLViewConfig.isEnable())
          || reposid.equals(RepositoryServiceUtil.TOSCANA_REPO_ID) || reposid.equals(RepositoryServiceUtil.SANITY_REPO_ID))
      {
        // view request from mail attachments will not use snapshot, to avoid additional load on Docs servers.
        logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_HTML_NON_SS.name());
        return ViewContext.VIEW_HTML_NON_SS;
      }
      else if (!(isIE8 || isIE9) && Platform.getViewerConfig().isPDFJsViewMode() && DocumentTypeUtils.isPDF(docMimeType))
      {
        logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_PDF.name());
        return ViewContext.VIEW_PDF;
      }
      else if (docMimeType == null || docMimeType.length() == 0 || isIE8 || DocumentTypeUtils.isPDF(docMimeType))
      {
        logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_IMAGE.name());
        return ViewContext.VIEW_IMAGE;
      }
      else if (!DocumentTypeUtils.isHTML(entry.getMimeType(), reposid))
      {
        logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_IMAGE.name());
        return ViewContext.VIEW_IMAGE;
      }
      else if (HTMLViewConfig.isEnable() && !notUseSSRequests)
      {
        if (Platform.checkSnapshotEntitlement(user, bNoCache))
        {
          logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_HTML_SS.name());
          return ViewContext.VIEW_HTML_SS;
        }
        else
        {
          logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_HTML_NON_SS.name());
          return ViewContext.VIEW_HTML_NON_SS;
        }
      }
      else if (HTMLViewConfig.isEnable())
      {
        logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_HTML_NON_SS.name());
        return ViewContext.VIEW_HTML_NON_SS;
      }
      else
      {
        logger.exiting(ViewRule.class.getName(), "getViewContext", ViewContext.VIEW_IMAGE.name());
        return ViewContext.VIEW_IMAGE;
      }
    }
    else
    {
      throw new Exception("Undefined view rule.  Rule: " + rule);
    }
  }
}
