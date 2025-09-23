package com.ibm.symphony.conversion.service.common.util;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Node;

public interface OdfElementListener
{
  public void onAttribute(OdfElement element, String name, String value);
  
  public void onElement(OdfElement pagent, Node node);
}
