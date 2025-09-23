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

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class ChartPlotAreaContext extends GeneralContext
{

  public ChartPlotAreaContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
  }

  public void startElement(AttributesImpl attributes)
  {
    super.startElement(attributes);
    // get the chart series type, row or column
    String styleName = this.getAttrValue("chart:style-name");
    if (styleName != null)
    {
      OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles) mContext.get("autostyles");
      OdfStyle style = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
      if (style != null)
      {
        String series = style.getProperty(OdfStyleChartProperties.SeriesSource);
        if (series != null && series.equals("rows"))
          mContext.put("ChartSeries", ConversionConstant.ROW_SERIES);
      }
    }
  }
}
