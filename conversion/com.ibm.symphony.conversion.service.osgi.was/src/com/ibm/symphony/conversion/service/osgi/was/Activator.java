/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.osgi.was;

import java.util.logging.Logger;

import org.osgi.framework.BundleContext;

import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.wsspi.runtime.osgi.WsBundleActivator;
import com.ibm.wsspi.runtime.service.WsServiceRegistry;

public class Activator extends WsBundleActivator {
	  // The plug-in ID
	  public static final String PLUGIN_ID = "com.ibm.symphony.conversion.service.osgi.was";

	  private static final Logger log = Logger.getLogger(Activator.class.getName());
	/*
	 * (non-Javadoc)
	 * @see org.osgi.framework.BundleActivator#start(org.osgi.framework.BundleContext)
	 */
	public void start(BundleContext context) throws Exception {
		super.start(context);
		IConversionService service = (IConversionService) context.getService(context.getServiceReference(IConversionService.class.getName()));
		WsServiceRegistry.addService(service, IConversionService.class);
		
		log.info("Conversion OGSI Service registered.");
	}

	/*
	 * (non-Javadoc)
	 * @see org.osgi.framework.BundleActivator#stop(org.osgi.framework.BundleContext)
	 */
	public void stop(BundleContext context) throws Exception {
		super.stop(context);
	}

}
