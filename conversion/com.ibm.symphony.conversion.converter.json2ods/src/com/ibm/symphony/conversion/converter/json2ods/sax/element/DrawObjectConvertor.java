package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.json2odf.ChartExport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;

public class DrawObjectConvertor
{
  TransformerHandler hdl;

  private ConversionContext context;

  private Object input;

  public DrawObjectConvertor(ConversionContext context, TransformerHandler hdl, Object input)
  {
    this.hdl = hdl;
    this.input = input;
    this.context = context;
  }

  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl(attributes);
    if (input instanceof DrawFrameRange)
    {
      DrawFrameRange range = (DrawFrameRange) input;
      if (range.usage == RangeType.CHART)
        attrs.addAttribute("", "", ConversionConstant.ODF_ATTR_XLINK_HREF, "", "./" + range.rangeId);
    }
    hdl.startElement(uri, localName, qName, attrs);
  }

  public void convert(ConversionContext context, Object input, boolean isNew)
  {
    if(!(input instanceof DrawFrameRange))
      return;
    
    DrawFrameRange range = (DrawFrameRange) input;
    if (range.usage == RangeType.CHART)
    {
      context.put("version_chart", true);
      OdfDocument doc = (OdfDocument)context.get("Document");
      String draftPath = (String)context.get("DraftFolder");
      boolean isODFFormula = (Boolean) context.get("isODFFormula");
      new ChartExport().convert(doc, draftPath, range.rangeId, isODFFormula);
    }
  }

  public void endElement(String uri, String localName, String qName) throws SAXException
  {
  }
}
