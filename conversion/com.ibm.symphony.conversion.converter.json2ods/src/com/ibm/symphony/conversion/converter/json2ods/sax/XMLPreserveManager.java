/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax;

import java.util.Set;

import javax.xml.transform.sax.TransformerHandler;

import com.ibm.symphony.conversion.converter.json2ods.sax.element.AnchorPreserveAction;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.CopyPreserveAction;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.DeletePreserveAction;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.PreserveAction;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSXMLReader;

public class XMLPreserveManager
{
  private TransformerHandler mXMLWriter;
  private ODSXMLReader reader;
  
  public XMLPreserveManager(TransformerHandler hdl)
  {
    mXMLWriter = hdl;
  }
  
  public void doPreserve(ConversionContext context,String id)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    Set<PreserveNameIndex> ids = index.getPreserveData(id);
    if(ids == null)
      return;
    for(PreserveNameIndex indexName: ids)
    {
      preserveByType(context,indexName,id);
    }

  }

  private void preserveByType(ConversionContext context, PreserveNameIndex indexName,String parentId)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    RangeType type = indexName.type;
    PreserveAction action = null;
    switch(type)
    {
      case ANCHOR:
      {
        action = new AnchorPreserveAction();
        action.doPreserve(context,mXMLWriter,indexName);
        break;
      }
      case DELETE:
      {
        if(null != indexName.address && !indexName.address.contains("#REF!"))
        {
          action = new DeletePreserveAction();
          action.doPreserve(context,mXMLWriter,indexName);
        }
        break;
      }
      case COPY:
      {
        if(!index.isDefaultFormatting(parentId))
        {
          action = new CopyPreserveAction();
          action.doPreserve(context,mXMLWriter,indexName,parentId);
        }
        break;
      }
    }
  }
  
}
