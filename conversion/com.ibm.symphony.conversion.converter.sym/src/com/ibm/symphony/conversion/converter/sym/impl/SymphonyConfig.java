/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym.impl;

import java.util.PriorityQueue;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

public class SymphonyConfig extends DefaultHandler
{
  private boolean load;

  private PriorityQueue<SymphonyDescriptor> queue;

  SymphonyConfig(PriorityQueue<SymphonyDescriptor> queue)
  {
    this.queue = queue;
  }

  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if ("symphony".equals(qName) && load)
    {
      String host = attributes.getValue("host");
      String port = attributes.getValue("port");
      SymphonyDescriptor descriptor = new SymphonyDescriptor(host, port);
      queue.offer(descriptor);

    }
    else if ("symphonys".equals(qName))
    {
      String product = attributes.getValue("product");

      if ("alexandria".equals(product))
        load = true;
      else
        load = false;
    }
  }

}
