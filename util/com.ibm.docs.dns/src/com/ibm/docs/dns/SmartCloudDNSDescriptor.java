/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.dns;

import sun.net.spi.nameservice.NameService;
import sun.net.spi.nameservice.NameServiceDescriptor;
import sun.net.util.IPAddressUtil;

public class SmartCloudDNSDescriptor implements NameServiceDescriptor
{

  @Override
  public NameService createNameService() throws Exception
  {
    return new SmartCloudDNSService();
  }

  @Override
  public String getProviderName()
  {
    return "docs";
  }

  @Override
  public String getType()
  {
    return "dns";
  }

}
