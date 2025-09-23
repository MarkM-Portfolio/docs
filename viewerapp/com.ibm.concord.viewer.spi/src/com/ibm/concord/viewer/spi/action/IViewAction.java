package com.ibm.concord.viewer.spi.action;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;

public interface IViewAction
{
  enum ViewType {
    HTML, IMAGE
  }

  public void init();

  // public boolean shouldViewFromDraft();

  public void serveViewerPage(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, InterruptedException;

  public void serveAttachment(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;

  public void logViewRequest();

  public void enableEdit(HttpServletRequest request);

  public void exec(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;

  /**
   * @return, true, HTML type; false, image type
   */
  public boolean isHTMLView();
  
  public IDocumentEntry getDocEntry();
  
  public UserBean getUser();
  
  public ICacheDescriptor getCacheDescriptor();
  
  public ViewContext getViewContext();
}
