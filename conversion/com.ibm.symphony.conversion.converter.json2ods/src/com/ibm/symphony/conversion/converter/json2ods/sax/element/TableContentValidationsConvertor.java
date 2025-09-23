package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.Iterator;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;

import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class TableContentValidationsConvertor extends GeneralConvertor  
{	
    public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter,Object input, OdfElement element)
    {
    	Document doc = (Document) context.get("Source");
    	
    	Iterator<String> iter =  doc.validationTransMgr.validationMap.keySet().iterator();
    	while( iter.hasNext() )
    	{
    		 String id = iter.next();
    		 ConversionUtil.Validation v = doc.validationTransMgr.validationMap.get(id);
    		 OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATION).convert(context, mXmlWriter ,v, element);
    	}
    }
    
    protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
    {
      JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
      OdfFileDom contentDom = (OdfFileDom)index.getDocuemnt();
      Element element = contentDom.createElementNS(ODSConvertUtil.getNameSpace(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATIONS),ConversionConstant.ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATIONS);
      return (OdfElement)element;
    }
}
