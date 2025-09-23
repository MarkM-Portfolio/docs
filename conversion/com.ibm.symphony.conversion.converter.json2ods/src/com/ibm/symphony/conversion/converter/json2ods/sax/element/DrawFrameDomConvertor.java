package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.ArrayList;
import java.util.List;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.draw.DrawAElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.svg.SvgTitleElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionElement;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.json2odf.ChartExport;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class DrawFrameDomConvertor extends GeneralConvertor
{
  private boolean isNew;
  
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    DrawFrameElement element = new DrawFrameElement(contentDocument);
    isNew = true;
    return element;
  }
  
  protected List<OdfElement> removeChildren(ConversionContext context,TransformerHandler mXmlWriter, OdfElement element)
  {
    //remove the children has been deleted
    if(element == null)
      return null;
	String xml = element.toString();
    if(qName == ConversionConstant.ODF_ELEMENT_DRAW_FRAME && !xml.contains(ConversionConstant.ODF_ELEMENT_SVG_TITLE) )
    {
      OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
      SvgTitleElement title = new SvgTitleElement(contentDocument);
      title.setTextContent("New");
      element.appendChild(title);
    }
    List<OdfElement> oldChildren = new ArrayList<OdfElement>();
    List<OdfElement> tailChildren = new ArrayList<OdfElement>();
    NodeList children = element.getChildNodes();
    
    int length = children.getLength();
    for( int i = 0 ;i < length; i++)
    {
      OdfElement child = (OdfElement)element.getFirstChild();
      OdfElement odfNode = (OdfElement) element.removeChild(child);
      oldChildren.add(odfNode);
      tailChildren.add(odfNode);
      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
      if((xmlId != null && !"".equals(xmlId)) || isNonPreserve(odfNode))
      {
        if(odfNode instanceof TableNamedExpressionElement)
          continue;
        tailChildren.clear();
      }
    }
    int size = oldChildren.size();
    boolean isPrePreserved = false ;
    for(int i = 0; i < size; i++ )
    {
      OdfElement odfNode = oldChildren.get(i);
      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
      if(isNonPreserve(odfNode))
      {
        isPrePreserved = true;
        continue;
      }
      element.appendChild(odfNode);
      String nodeName = odfNode.getNodeName();
      if(isPrePreserved)
        PreserveConvertorFactory.getInstance().getConvertor(nodeName).buildDOMNode(context,mXmlWriter, odfNode, element);
      else
      {
        if(ConversionConstant.ODF_ELEMENT_DRAW_IMAGE.equals(nodeName))
        {
          DrawImageDomConvertor convertor = new DrawImageDomConvertor();
          convertor.setInput(pInput);
          convertor.convert(context, mXmlWriter, odfNode, element);
        }
        else if(ConversionConstant.ODF_ELEMENT_SVG_TITLE.equals(nodeName))
        {
          SvgTitleDescDomConvertor convertor = new SvgTitleDescDomConvertor();
          convertor.setInput(pInput);
          convertor.convert(context, mXmlWriter, odfNode, element);
        }
        else
          PreserveConvertorFactory.getInstance().getConvertor(nodeName).convert(context,mXmlWriter, odfNode, element);
      }
    }
    return tailChildren;
  }
  
  protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
  {
	 DrawFrameRange range = (DrawFrameRange)input;
	 if(isNew)
     {
      if(range.usage==RangeType.CHART)
      {
    	  DrawObjectDomConvertor objConvertor = new DrawObjectDomConvertor();
    	  objConvertor.setInput(pInput);
    	  objConvertor.convert(context, mXmlWriter, null, element);
      }
      else
      {
    	  DrawImageDomConvertor convertor = new DrawImageDomConvertor();
          convertor.setInput(pInput);
          convertor.convert(context, mXmlWriter, null, element);
      }
    }
	 
	if(range.usage == RangeType.CHART)
	{
		  String src = range.href;
		  int idx = src.lastIndexOf("/");
		  String objName = src.substring(idx+1);
		  src = "ObjectReplacements/" + objName;
		  OdfDocument doc = (OdfDocument)context.get("Document");
		  OdfPackage odfPackage = doc.getPackage();
		  odfPackage.remove(src);
	      
		  String draftPath = (String)context.get("DraftFolder");
		  boolean isODFFormula = (Boolean) context.get("isODFFormula");
	      new ChartExport().convert(doc, draftPath, range.rangeId, isODFFormula);
	}
  }
  
  protected String getNodeId(Object input)
  {
    if(id != null && !"".equals(id))
      return id;
    if(input instanceof OdfElement)
    {
      String sId = ((OdfElement)input).getAttribute(IndexUtil.ID_STRING);
      if(sId!= null && !"".equals(sId))
      {
        this.id = sId;
      }
      return this.id;
    }
    else if(input instanceof Range)
    {
      return this.id = ((Range)input).rangeId;
    }
    return null;
  }
  
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    if(input instanceof DrawFrameRange)
    {
      DrawFrameRange range = (DrawFrameRange)input;
      DrawFrameElement frame = (DrawFrameElement)element;
      String x = ODSConvertUtil.convertPXToCM(range.x);
      frame.setSvgXAttribute(x);
      //for the height gap of empty row between IBM Docs and Symphony
      //workaround to set factor 16/17
      double dy = range.y;
      if(isNew)
        dy = range.y*16/17;
      String y = ODSConvertUtil.convertPXToCM(dy);
      frame.setSvgYAttribute(y);
      String w = ODSConvertUtil.convertPXToCM(range.w);
      frame.setSvgWidthAttribute(w);
      String h = ODSConvertUtil.convertPXToCM(range.h);
      frame.setSvgHeightAttribute(h);
      if(range.z > -1)
      {
        frame.setDrawZIndexAttribute(range.z);
      }
      String drawName = element.getAttribute(ConversionConstant.ODF_ATTRIBUTE_DRAW_NAME);
      if(!ConversionUtil.hasValue(drawName))
      {
        frame.setDrawNameAttribute(range.rangeId);
      }

    }    
  }
  
  protected void appendElement(ConversionContext context,TransformerHandler mXmlWriter,List<OdfElement> pList, OdfElement parent)
  {
  }
  
}
