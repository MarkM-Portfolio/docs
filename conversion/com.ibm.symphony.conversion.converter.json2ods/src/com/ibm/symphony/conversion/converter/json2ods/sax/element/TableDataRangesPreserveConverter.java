/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class TableDataRangesPreserveConverter extends GeneralPreserveConvertor
{
  private static final Logger LOG = Logger.getLogger(TableDataRangesPreserveConverter.class.getName());
  public void convertChildren(ConversionContext context, TransformerHandler mXmlWriter, Object input, OdfElement element)
  {
    Document doc = (Document) context.get("Source");
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    OdfFileDom contentDom = (OdfFileDom)index.getDocuemnt();
    try
    {
    	HashSet<String> filterSheetNameSet = new HashSet<String>();
        NodeList prangeNodes = element.getElementsByTagName(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE);
        int num = prangeNodes.getLength();
        //Get all exist filters
        int nlength = doc.unnameList.size();
        for (int i = 0; i < nlength; i++)
        {
          ConversionUtil.Range range = (ConversionUtil.Range) doc.unnameList.get(i);
          if (range != null && range.usage == RangeType.FILTER)
          {
            String sheetName = "";
            String address = range.address;
            if (address != null)
            {
              ReferenceParser.ParsedRef ref1 = ReferenceParser.parse(address);
              sheetName = ref1.getSheetName();
              filterSheetNameSet.add(sheetName);
              boolean bOriginal = false;
              if(range instanceof ConversionUtil.UnNameRange)  
              {
            	  ConversionUtil.UnNameRange uRange =(ConversionUtil.UnNameRange) range;
                  if(uRange.data.containsKey(ConversionConstant.ORIGINAL_ODS_FILTER ))  
                      bOriginal = Boolean.parseBoolean(uRange.data.get(ConversionConstant.ORIGINAL_ODS_FILTER).toString()) ;
              }

              //the same with original, needs preserve
              if(bOriginal)
              {
            	  String rId = range.rangeId;
            	  for( int j = 0; j < num; j++)
            	  {
                      OdfElement node = (OdfElement)prangeNodes.item(j);
                      String elementId = node.getAttribute(ConversionConstant.ID_STRING);
                      if(rId.equals(elementId))
                      {
                    	  node.setAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_TARGET_RAGNE_ADDRESS,address);
                          Element newelement = contentDom.createElementNS(ODSConvertUtil.getNameSpace(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES),ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES);
                          //Convert the preserved filters to ODS
                          PreserveConvertorFactory.getInstance().getConvertor(node.getNodeName()).convert(context, this.mXmlWriter, node, newelement);
                    	  break;
                      }
            	  }
              }
              else
              {
                  //newelement is useless for the conversion result
                  Element newelement = contentDom.createElementNS(ODSConvertUtil.getNameSpace(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES),ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES);
                  //Convert the supported filters to ODS
                  OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE).convert(context, mXmlWriter, range, newelement);
              }
            } 
          }
        }
        
        JSONObject pnames = (JSONObject) doc.docPreserveJSON.get("pnames");
        if(pnames == null)
        	return;
        Set<Entry<String, JSONObject>> pnamesEntrySet = pnames.entrySet();
        Iterator pnamesEntryIter = pnamesEntrySet.iterator();
        while(pnamesEntryIter.hasNext())
        {
            Entry<String, JSONObject> pnamesEntry = (Entry<String, JSONObject>) pnamesEntryIter.next();
            String preserveId = (String)pnamesEntry.getKey();
            JSONObject pnameValue = (JSONObject) pnamesEntry.getValue();
            Entry<String, JSONObject> entry = (Entry<String, JSONObject>) pnameValue.entrySet().iterator().next();
            String addr = entry.getValue().get("addr").toString();
            ReferenceParser.ParsedRef ref = ReferenceParser.parse(addr);
            if(!filterSheetNameSet.contains(ref.sheetName) && ref!= null && !ConversionConstant.INVALID_REF.equals(ref.sheetName) && 
                    !ConversionConstant.INVALID_REF.equals(ref.startRow) && !ConversionConstant.INVALID_REF.equals(ref.endRow) &&
                    !ConversionConstant.INVALID_REF.equals(ref.startCol) && !ConversionConstant.INVALID_REF.equals(ref.endCol))
            {
                //the preserved filter
                for (int j = 0; j < num; j++)
                {
                	OdfElement node = (OdfElement)prangeNodes.item(j);
                	String elementId = node.getAttribute(ConversionConstant.ID_STRING);
                	if(preserveId.equals(elementId))
                	{
                        node.setAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_TARGET_RAGNE_ADDRESS,addr);
                        //newelement is useless for the conversion result
                        Element newelement = contentDom.createElementNS(ODSConvertUtil.getNameSpace(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES),ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES);
                        //Convert the preserved filters to ODS
                        PreserveConvertorFactory.getInstance().getConvertor(node.getNodeName()).convert(context, this.mXmlWriter, node, newelement);
                        break;
                	}
                }
            }	
        }
    }
    catch (Exception e)
    {
    	LOG.log(Level.WARNING, "export range filter error", e);
    }
  }

}
