/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.css;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.attribute.style.StyleNameAttribute;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.TableTemplateCssUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

/**
 * Convert
 * <table:table-template>
 * element. This element contains children that define the name of the styles to use for the rows/columns of a table template that can be
 * applied to a
 * <table>
 * element.
 * 
 */
public class TableTemplateConvertor extends ODFStyleElementConvertor
{
  private static final String CLASS = CSSConvertorFactory.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  /**
   * Build corresponding CSS styles for the table templates. The CSS styles are built using CSS selectors and are NOT named the same as the
   * text:style-name. They are named based on the template name and the class name the editor uses for the particular row/column.
   * 
   * For example: Processing a template named "SymSkyblue" that has a <code><table:first-row></code> element with a
   * <code><text:style-name="SymSkyblue3"></code> will have a CSS style created as <code>".SymSkyBlue .tableHeaderRow td {xxx}"</code>.
   * Refer to the helper class <code>TableTemplateCssUtil</code> to see the mappings of template cell styles to CSS styles.
   * 
   * ASSUMPTION: we have assumed that the <code><style:style></code> element that the template cell styles point to have previously been
   * processed - so Symphony needs to create them first in the styles.xml.
   * 
   * (non-Javadoc)
   * 
   * @see com.ibm.symphony.conversion.presentation.importodf.css.ODFStyleElementConvertor#doConvert(com.ibm.symphony.conversion.service.common.ConversionContext,
   *      org.w3c.dom.Node, java.lang.Object)
   */

  @SuppressWarnings({ "unchecked", "restriction" })
  @Override
  protected void doConvert(ConversionContext context, Node element, Object output)
  {
    String tableTemplateStyleName; // current table template style name
    Map<String, String> saveStyleMapNames; // map the css selector to the style map to copy
    TableTemplateCssUtil templateCssStyles; // helper object to get the css selector names and order of them

    saveStyleMapNames = new HashMap<String, String>();
    String defaultTemplateStyleName = "";

    // get the <table:table-template> style name
    tableTemplateStyleName = ((OdfElement) element).getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME);

    if (tableTemplateStyleName == null || tableTemplateStyleName.length() == 0) // shouldn't ever happen, but just in case
    {
      log.warning("No text:style-name found for table:table-template element " + element.toString());
      return;
    }

    templateCssStyles = new TableTemplateCssUtil();

    // add the css selector name for the default template style name (if we have one)
    try
    {
      OdfStyle tableCellDS = ((OdfDocument) context.getSource()).getStylesDom().getOfficeStyles()
          .getStyle(ODPConvertConstants.DEFAULT, OdfStyleFamily.TableCell);
      defaultTemplateStyleName = tableCellDS.getOdfAttributeValue(StyleNameAttribute.ATTRIBUTE_NAME);
      buildCssStyleArray(defaultTemplateStyleName, "default", tableTemplateStyleName, saveStyleMapNames, templateCssStyles);
    }
    catch (Exception e)
    {
    }

    // Loop thru the table:table-template children, creating the css style names to use
    NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      String childNodeName = child.getNodeName();

      // now get the cell style name from the ODF element
      String cellTemplateStyleName = ((OdfElement) child).getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME);
      if (cellTemplateStyleName == null || cellTemplateStyleName.length() == 0) // shouldn't ever happen, but just in case
      {
        log.info("No text:style-name found for table template cell style element " + child.toString());
        continue;
      }

      // create the new css style
      buildCssStyleArray(cellTemplateStyleName, childNodeName, tableTemplateStyleName, saveStyleMapNames, templateCssStyles);
    }

    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) output;

    // Now lets write them out to the css file in the right order for specificity
    // (which is the reverse order of what is returned by the TableTemplateCssUtil.getCellStyles() method)
    HashSet<String> oldStyleMapNames = (HashSet<String>) context.get(ODPConvertConstants.CONTEXT_OLD_TABLE_TEMPLATE_STYLENAMES);

    if (oldStyleMapNames == null)
    {
      oldStyleMapNames = new HashSet<String>();
      context.put(ODPConvertConstants.CONTEXT_OLD_TABLE_TEMPLATE_STYLENAMES, oldStyleMapNames);
    }

    ArrayList<String> cssStyles = templateCssStyles.getCssStyleNames();
    for (int i = cssStyles.size() - 1; i >= 0; i--)
    {
      String cssStyleName = cssStyles.get(i);
      String cellTemplateStyleMapName = saveStyleMapNames.get(cssStyleName);

      // get the original style map for this cell template style
      Map<String, String> styleMap = styles.get(CSSConvertUtil.getStyleName(cellTemplateStyleMapName));
      if (styleMap != null)
      {
        // create a newly named style map, using the same contents as before but with our new selector style map name
        styles.put(cssStyleName, styleMap);
        oldStyleMapNames.add(cellTemplateStyleMapName);
      }
    }
  }

  /**
   * Build the css style name for this template style type.
   * 
   * @param cellTemplateStyleName
   *          - name of style name for the current node (e.g. "SymSkyblue3")
   * @param nodeName
   *          - current template style we are processing (e.g. "table:first-row")
   * 
   */
  private void buildCssStyleArray(String cellTemplateStyleName, String nodeName, String tableTemplateStyleName,
      Map<String, String> saveStyleMapNames, TableTemplateCssUtil templateCssStyles)
  {
    // create/add css style name to the local css style object
    String cssStyleName = templateCssStyles.addCellStyle(tableTemplateStyleName, nodeName);

    // save off the template style name (e.g. "SymSkyblue3") to a so we know what style map this cell style type maps to
    saveStyleMapNames.put(cssStyleName, cellTemplateStyleName);

  }

}
