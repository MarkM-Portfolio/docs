/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.style;


import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableColumnProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;

public class TableColumnStyleHelper
{
  private static final String CLAZZ = TableColumnStyleHelper.class.getName();
  private static final Logger LOG = Logger.getLogger(TableColumnStyleHelper.class.getName());
  public void convert(OdfElement styles, ConversionContext context)
  {
    LOG.entering(CLAZZ, "convert");
    try{
      if(styles == null)
        return;
      Iterator<OdfStyle> columnStyleIter = null;
      OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles) styles;
      columnStyleIter = autoStyles.getStylesForFamily(OdfStyleFamily.TableColumn).iterator();
      while (columnStyleIter.hasNext())
      {
        OdfStyle odfColumnStyle = columnStyleIter.next();
        String parentName = odfColumnStyle.getStyleParentStyleNameAttribute();
        if(parentName !=null && parentName.equals("DefaultColWidthFromXlsToOds"))
        {
        	String defaultColumnWidth = odfColumnStyle.getProperty(OdfStyleTableColumnProperties.ColumnWidth);
        	
        	if (defaultColumnWidth != null){
        	    int width = 0;
        	    width = Length.parseInt(defaultColumnWidth, Unit.PIXEL);
	        	Document document = (Document) context.get("Target");
	        	document.defaultColumnWidth = width;        	
	        	break;
        	}
        }
      }

      
    }catch (Exception e) {
      LOG.log(Level.WARNING,"Convert Column style failed", e);
    }
    LOG.exiting(CLAZZ, "convert");
  }

}
