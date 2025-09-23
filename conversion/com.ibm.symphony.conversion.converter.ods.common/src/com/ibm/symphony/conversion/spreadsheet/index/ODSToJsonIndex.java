/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;



public class ODSToJsonIndex
{
  private String draftFolderPath ;
  
  Logger LOG = Logger.getLogger(ODSToJsonIndex.class.getName());
  
  public ODSToJsonIndex(String path)
  {
    draftFolderPath = path;
  }
  
  public void addIdOnOdfElement(OdfElement odfElement, String id)
  {
    IndexUtil.setXmlId(odfElement, id);
  }
  
  public boolean isOdfNodeIndexed(OdfElement odfNode) 
  {
    String xmlid = odfNode.getAttribute(IndexUtil.ID_STRING);
    if (xmlid == null || xmlid.equals(""))
      return false;
    return true;
  }
  
  public String getOdfNodeIndex(OdfElement odfNode)
  {
    String xmlid = odfNode.getAttribute(IndexUtil.ID_STRING);
    return xmlid;
  }
  
  public void save(OdfDocument odfDoc)
  {
    try
    {
      if (odfDoc != null)
        odfDoc.save(draftFolderPath + File.separator + IndexUtil.ODFDRAFT_NAME);
    }
    catch (FileNotFoundException e)
    {
      e.printStackTrace();
      LOG.severe(e.getMessage());
    }
    catch (IOException e)
    {
      e.printStackTrace();
      LOG.severe(e.getMessage());
    }
    catch (Exception e)// ODFDOM throws the Exception, we can not detail it
    {
      e.printStackTrace();
      LOG.severe("ODMDOM save exception:" + e.getMessage());
    }
  }
  
}
