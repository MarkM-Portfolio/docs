/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.repository;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import com.ibm.lconn.files.spi.remote.DocumentService;
import com.ibm.tk.rproxysvc.service.TKRemoteServiceDescriptor;
import com.ibm.tk.rproxysvc.service.TKRemoteServiceProxyFactory;
import com.ibm.tk.rproxysvc.transport.TKRemoteServiceEndpointDescriptor;
import com.ibm.tk.rproxysvc.transport.TKRemoteServiceEndpointType;
import com.ibm.tk.rproxysvc.transport.TKRemoteServiceUnavailableException;

/**
 *
 */
public class FilesClient implements TKRemoteServiceEndpointDescriptor
{
  public static final String COMPONENT_NAME = "files";

  public static final String JNDI_NAME = "ejb/Files/tk.rproxysvc.transport.ejb.jar/TKRemoteProxySvc#com.ibm.tk.rproxysvc.internal.transport.ejb.TKRemoteServiceEndpointEjbRemote";

  private Properties env;

  private DocumentService documentService;

  private String clusterName;

  private static final Logger LOG = Logger.getLogger(FilesClient.class.getName());

  public DocumentService getDocumentService()
  {
    return documentService;
  }

  public FilesClient(Properties env, String tenantId, String clusterName)
  {
    LOG.entering(FilesClient.class.getName(), "FilesClient", new Object[] { env, tenantId, clusterName });
    this.env = env;
    this.documentService = TKRemoteServiceProxyFactory.getInstance(TKRemoteServiceProxyFactory.newContext(new MTServiceCallContextProvider(tenantId), Collections.singleton(this)),
        new TKRemoteServiceDescriptor<DocumentService>(DocumentService.class, COMPONENT_NAME));
    this.clusterName = clusterName;

    LOG.exiting(FilesClient.class.getName(), "FilesClient");
  }

  private EnumSet<TKRemoteServiceEndpointType> transports = EnumSet.allOf(TKRemoteServiceEndpointType.class);

  public String getComponentName()
  {
    return COMPONENT_NAME;
  }

  public EnumSet<TKRemoteServiceEndpointType> getSupportsTransports()
  {
    return transports;
  }

  public Object lookupEjb() throws TKRemoteServiceUnavailableException
  {
    LOG.entering(FilesClient.class.getName(), "lookupEjb");
    try
    {
      Context ic;

      String ejbInterface = JNDI_NAME;

      // The cluster name of Files server
      if (clusterName != null & clusterName.length() > 0)
      {
        ic = new InitialContext();
        ejbInterface = "cell/clusters/" + clusterName + "/" + ejbInterface;
      }
      else
      {
        ic = new InitialContext(env);
      }

      Object homeObject = ic.lookup(ejbInterface);
      
      LOG.entering(FilesClient.class.getName(), "lookupEjb", homeObject);
      return homeObject;
    }
    catch (NamingException e)
    {
      throw new TKRemoteServiceUnavailableException(e);
    }
  }
}
