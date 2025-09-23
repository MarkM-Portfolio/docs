/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;

public class BlockStyleData implements Data
{
  HTMLAttributes attributes = new HTMLAttributes();

  private static final Logger LOG = Logger.getLogger(BlockStyleData.class.getName());

  public void read(JSONObject ob)
  {
    try
    {
      attributes.read(ob);
    }
    catch (NumberFormatException e)
    {
      e.printStackTrace();
    }
  }

  public JSONObject toJSON()
  {
    JSONObject ob = new JSONObject();
    attributes.write(ob);
    return ob;
  }

  public void apply(BlockStyleOperation blockStyleOperation, Document dom)
  {
    Element e = dom.getDocumentElement();
    Element element = XHTMLDomUtil.getElementbyId(e, blockStyleOperation.getTarget());

    if(element == null)
    {
//      String msgs = "The target is null"; 
//      LOG.log(Level.INFO, "Apply Attribute message error: " + msgs);
      return;
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("Apply Element:" + XHTMLDomUtil.getContent(element));
      JSONObject ob = blockStyleOperation.write();
      LOG.finer(ob.toString());
    }

    if (blockStyleOperation.isRemove())
      attributes.removeBlockStyle(element);
    else
      attributes.setBlockStyle(element);
    element.normalize();
    
    //#9588
    if( element.getNodeName().equalsIgnoreCase("li") && attributes.isModifiedAttribute("class"))
    {
       String listClass = ListUtil.getListClass( element );
       if( listClass == null )
       {
          Node node = element.getFirstChild();
          if( node != null && XHTMLDomUtil.isBogus(node) && node.getNextSibling()!= null )
            element.removeChild(node);
       }
    }
    
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("Apply result:" + XHTMLDomUtil.getContent(element));
    }
  }

  public void write(JSONObject ob)
  {
      attributes.write(ob);
  }
  
  public boolean checkSuspicious()
  {
    return attributes.checkSuspicious();
  }
  
}
