/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.proxy.filter;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.ws.proxy.filter.http.HttpProxyServerFilter;
import com.ibm.wsspi.http.channel.HttpResponseMessage;
import com.ibm.wsspi.http.channel.values.StatusCodes;
import com.ibm.wsspi.proxy.filter.FilterWrapper;
import com.ibm.wsspi.proxy.filter.http.HttpFilterStatusCode;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;

/**
 *
 */
public class ConcordResponseSettingsFilter extends HttpProxyServerFilter
{
	private static Logger logger = Logger.getLogger(ConcordResponseSettingsFilter.class.getName());
	
	/*
	 * (non-Javadoc)
	 * @see com.ibm.wsspi.proxy.filter.http.HttpDefaultFilter#init(com.ibm.wsspi.proxy.filter.FilterWrapper)
	 */
	public void init(FilterWrapper filterWrapper) throws Exception
	{
		logger.entering(ConcordResponseSettingsFilter.class.getName(), "init()");
		
		super.init(filterWrapper);

		logger.exiting(ConcordResponseSettingsFilter.class.getName(), "init()");
	}
	
	/*
	 * (non-Javadoc)
	 * @see com.ibm.wsspi.proxy.filter.http.HttpDefaultFilter#doFilter(com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext)
	 */
	public StatusCodes doFilter(HttpProxyServiceContext serviceContext) throws Exception
	{
		logger.entering(ConcordResponseSettingsFilter.class.getName(), "doFilter()");
	  
		StatusCodes statusCodes = HttpFilterStatusCode.STATUS_FILTER_SUCCESS;
		
		// Set a default content type to response. Because HTTP compress filter of PROXY server needs the type.
		HttpResponseMessage response = serviceContext.getResponse();
		if (response.getMIMEType() == null)
		{
			response.setMIMEType("text/html");
			if (logger.isLoggable(Level.FINEST))
			{
				logger.log(Level.FINEST, "The content type of request " + serviceContext.getRequest().getRequestURI() + " is null");
			}
		}
        
		logger.exiting(ConcordResponseSettingsFilter.class.getName(), "doFilter()");
		
		return statusCodes;
	}
}
