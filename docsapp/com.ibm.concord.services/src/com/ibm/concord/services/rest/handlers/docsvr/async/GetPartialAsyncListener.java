/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr.async;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.AsyncContext;
import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

/**
 * 
 */
public class GetPartialAsyncListener implements AsyncListener
{

  private static final Logger LOG = Logger.getLogger(GetPartialAsyncListener.class.getName());

  private AsyncContext asyncContext;

  private IDocumentEntry docEntry;

  private UserBean caller;

  /**
   * @param asyncContext
   * @param docEntry
   * @param caller
   */
  public GetPartialAsyncListener(AsyncContext asyncContext, IDocumentEntry docEntry, UserBean caller)
  {
    super();
    this.asyncContext = asyncContext;
    this.docEntry = docEntry;
    this.caller = caller;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.AsyncListener#onComplete(javax.servlet.AsyncEvent)
   */
  @Override
  public void onComplete(AsyncEvent asyncEvent) throws IOException
  {
    LOG.info(new ActionLogEntry(caller, Action.ASYNC_GET_PARTIAL, docEntry.getDocUri(), " onComplete ").toString());
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.AsyncListener#onError(javax.servlet.AsyncEvent)
   */
  @Override
  public void onError(AsyncEvent asyncEvent) throws IOException
  {
    asyncContext.complete();
    LOG.info(new ActionLogEntry(caller, Action.ASYNC_GET_PARTIAL, docEntry.getDocUri(), " onError : "
        + asyncEvent.getThrowable().getMessage()).toString());
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.AsyncListener#onStartAsync(javax.servlet.AsyncEvent)
   */
  @Override
  public void onStartAsync(AsyncEvent asyncEvent) throws IOException
  {
    LOG.info(new ActionLogEntry(caller, Action.ASYNC_GET_PARTIAL, docEntry.getDocUri(), " onStartAsync ").toString());
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.AsyncListener#onTimeout(javax.servlet.AsyncEvent)
   */
  @Override
  public void onTimeout(AsyncEvent asyncEvent) throws IOException
  {
    LOG.entering(this.getClass().getName(), "onTimeout");
    LOG.info(new ActionLogEntry(caller, Action.ASYNC_GET_PARTIAL, docEntry.getDocUri(), " onTimeout ").toString());
    HttpServletResponse response = (HttpServletResponse) this.asyncContext.getResponse();
    JSONObject json = new JSONObject();
    json.put("status", "error");
    json.put("error_code", DocumentServiceException.EC_DOCUMENT_ASYNC_RESPONSE_TIME_OUT);
    json.put("error_msg", "GetPartial Timeout");
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(DocumentServiceException.EC_DOCUMENT_ASYNC_RESPONSE_TIME_OUT);
    json.serialize(response.getWriter(), true);
    asyncContext.complete();
    LOG.exiting(this.getClass().getName(), "onTimeout");
  }

}
