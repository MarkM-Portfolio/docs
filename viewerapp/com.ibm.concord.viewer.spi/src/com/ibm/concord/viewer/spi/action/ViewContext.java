package com.ibm.concord.viewer.spi.action;

public enum ViewContext
{
  VIEW_PDF,
  VIEW_IMAGE,
  VIEW_HTML_NON_SS, /*html, but not snapshot*/
  VIEW_HTML_SS,      /*html, snapshot*/
  VIEW_THUMBNAIL
}
