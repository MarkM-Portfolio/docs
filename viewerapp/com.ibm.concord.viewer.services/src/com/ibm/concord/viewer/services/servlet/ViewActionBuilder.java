package com.ibm.concord.viewer.services.servlet;

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.util.ViewRule;
import com.ibm.concord.viewer.spi.action.IViewAction;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;

public class ViewActionBuilder
{
  private static final Logger logger = Logger.getLogger(ViewActionBuilder.class.getName());

  public static IViewAction getViewAction(final UserBean user, final IDocumentEntry entry, final String contentPath, String modified,
      HashMap<String, Boolean> parameters, final String userAgent) throws Exception
  {
    logger.entering(ViewActionBuilder.class.getName(), "getViewAction");

    IViewAction vwAct = null;
    final Boolean compact = parameters.get(ViewRule.PARAM_MODE_COMPACT);

    try
    {
      ViewContext context = ViewRule.getViewContext(new HashMap<String, Object>()
      {
        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        {
          put(ViewRule.PARAM_DOCENTRY, entry);
          put(ViewRule.PARAM_USER_AGENT, userAgent);
          put(ViewRule.PARAM_USER, user);
          put(ViewRule.PARAM_MODE_COMPACT, compact);
          put(ViewRule.PARAM_CONTENT_PATH, contentPath);
        }
      });
      switch (context)
        {
          case VIEW_PDF :
            vwAct = new PdfViewAction(user, entry, contentPath, modified, parameters);
            break;      
          case VIEW_IMAGE :
            vwAct = new ImageViewAction(user, entry, contentPath, modified, parameters);
            break;
          case VIEW_HTML_NON_SS :
            vwAct = new HtmlViewAction(user, entry, contentPath.replace("content/", ""), modified, parameters);
            break;
          case VIEW_HTML_SS :
            vwAct = new SnapshotViewAction(user, entry, contentPath.replace("content/", ""), modified, parameters);
            break;
          default:
            return null;
        }
      vwAct.init();
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to create a view action.", e);
      throw e;
    }

    logger.exiting(ViewActionBuilder.class.getName(), "getViewAction", vwAct.getClass().getName());
    return vwAct;
  }
}
