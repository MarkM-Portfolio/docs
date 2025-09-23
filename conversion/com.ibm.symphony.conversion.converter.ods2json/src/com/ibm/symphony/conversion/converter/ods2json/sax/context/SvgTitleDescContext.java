/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;

public class SvgTitleDescContext extends GeneralContext
{
  private StringBuffer mCharsForTextNode = new StringBuffer();
  String mText;
  ConversionUtil.DrawFrameRange nameCellRange;
  public SvgTitleDescContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
    mText = null;
  }
  
  public void startElement(AttributesImpl attributes)
  {
	DrawFrameContext pContext = (DrawFrameContext)this.getParentConvertor();
	nameCellRange = pContext.getFrameRange();
	if(!(nameCellRange.usage == RangeType.CHART) && !(nameCellRange.usage == RangeType.IMAGE))
	{
	  super.startElement(attributes);
	}   
  }
  
  public void characters(char[] ch, int start, int length)
  {
	if(nameCellRange.usage == RangeType.CHART || nameCellRange.usage == RangeType.IMAGE)
	{
	  mCharsForTextNode.append(ch, start, length);
	  if (mCharsForTextNode.length() > 0)
      {
	    mText = mCharsForTextNode.toString();
	  }
	}
	else
	{
	  super.characters(ch, start, length);
	}   
  }
  
  public void endElement()
  {
    if(nameCellRange.usage == RangeType.CHART || nameCellRange.usage == RangeType.IMAGE)
    {
	  if(mQName == ConversionConstant.ODF_ELEMENT_SVG_TITLE)
	  {
	    nameCellRange.alt = mText;
	  } 
    }
    else
    {
      super.endElement();
    }
  }
}