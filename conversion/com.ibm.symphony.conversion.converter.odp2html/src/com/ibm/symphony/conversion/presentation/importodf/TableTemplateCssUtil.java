/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf;

import java.util.ArrayList;
import java.util.HashMap;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

/**
 * Helper class to build up an array of the CSS style names for table template cell styles. It maps the ODF table cell style to a CSS style
 * name, and then put them in an array in the order of specificity.
 * 
 */
public class TableTemplateCssUtil
{

  private String[] _cssStyleNames = new String[8];

  // Default Initial Capacity for the Cell Style HashMap
  private static final int CELL_STYLE_MAP_CAPACITY = (int) (8 * 1.33) + 1;

  private static HashMap<String, String> _cellStyleMap;

  private static HashMap<String, Integer> _cellStyleOrderMap;
  static
  {
    // Map the ODF template cell type to the CSS selector name
    _cellStyleMap = new HashMap<String, String>(CELL_STYLE_MAP_CAPACITY);
    _cellStyleMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_COLUMN, "td." + ODPConvertConstants.CSS_TABLE_HEADER_COLUMN);
    _cellStyleMap.put(ODPConvertConstants.ODF_ELEMENT_TABLELAST_COLUMN, "td." + ODPConvertConstants.CSS_TABLE_LAST_COLUMN);
    _cellStyleMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_ROW, "." + ODPConvertConstants.CSS_TABLE_HEADER_ROW + " td");
    _cellStyleMap.put(ODPConvertConstants.ODF_ELEMENT_TABLELAST_ROW, "." + ODPConvertConstants.CSS_TABLE_LAST_ROW + " td");
    _cellStyleMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEODD_ROWS, "." + ODPConvertConstants.CSS_TABLE_ALTERNATE_ROW + " td");
    _cellStyleMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEODD_COLUMNS, "td." + ODPConvertConstants.CSS_TABLE_ALTERNATE_COLUMN);
    _cellStyleMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEBODY, "td.table_table-cell"); // using "table_table-cell" so it's unique from the
                                                                                         // "default" css style
    _cellStyleMap.put("default", "td");

    // Create a map tell us the order that these styles need to be created so we get them
    // in the right order with regard to css specificity. Those selectors that are defined last in
    // the style list have higher priority (with all other specificity numbers being equal).
    _cellStyleOrderMap = new HashMap<String, Integer>(CELL_STYLE_MAP_CAPACITY);
    _cellStyleOrderMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_COLUMN, 7);
    _cellStyleOrderMap.put(ODPConvertConstants.ODF_ELEMENT_TABLELAST_COLUMN, 6);
    _cellStyleOrderMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_ROW, 5);
    _cellStyleOrderMap.put(ODPConvertConstants.ODF_ELEMENT_TABLELAST_ROW, 4);
    _cellStyleOrderMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEODD_ROWS, 3); 
    _cellStyleOrderMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEODD_COLUMNS, 2);
    _cellStyleOrderMap.put(ODPConvertConstants.ODF_ELEMENT_TABLEBODY, 1);
    _cellStyleOrderMap.put("default", 0);

  }

  /**
   * Constructor - initialize member data
   * 
   */
  public TableTemplateCssUtil() // constructor
  {
    // init array that holds the css style names to an empty string
    for (int i = 0; i < _cssStyleNames.length; i++)
    {
      _cssStyleNames[i] = "";
    }

  } // end, constructor

  /*
   * Add the css style name for this template cell style type to the current object.
   * 
   * @param tableTemplateStyleName - name of table template style name (e.g. "SymSkyblue")
   * 
   * @param nodeName - current template style we are processing (e.g. "table:first-row")
   * 
   * @return String - css style name that was added
   */
  public String addCellStyle(String tableTemplateStyleName, String nodeName)
  {
    StringBuilder bfr = new StringBuilder(128);

    // first, get the css selector name we are going to create
    String cssSelector = _cellStyleMap.get(nodeName);
    if (cssSelector != null && cssSelector.length() > 0)
    {

      if (tableTemplateStyleName != null && tableTemplateStyleName.length() > 0)
      {
        // prepend the table template style name to our new css style name
        bfr.append(ODPConvertConstants.SYMBOL_DOT);
        bfr.append(tableTemplateStyleName);
        bfr.append(ODPConvertConstants.SYMBOL_WHITESPACE);
      }

      bfr.append(cssSelector);
      bfr.append(ODPConvertConstants.SYMBOL_WHITESPACE);

      // now save away the new style map info in an array, because we need to put them in a specific order
      _cssStyleNames[getCellStylePrecedence(nodeName)] = bfr.toString(); // add it to our list

    }

    return bfr.toString();
  }

  /*
   * Get the numeric order of precedence for a particular template cell type
   * 
   * @param nodeName - template cell type (e.g. "table:first-row")
   * 
   * @return int - precedence order - zero being the highest. If the cell type is not mapped, -1 is returned
   */
  public int getCellStylePrecedence(String nodeName)
  {
    Integer index = _cellStyleOrderMap.get(nodeName);
    if (index == null)
      index = -1;

    return index;
  }

  /*
   * Return the list of css style names, in order of precedence (zero being the highest precedence).
   * 
   * @return ArrayList<String> - list of styles, formatted for css
   */
  public ArrayList<String> getCssStyleNames()
  {
    int capacity = ODPCommonUtil.calculateArrayCapacity(_cssStyleNames.length);
    ArrayList<String> returnList = new ArrayList<String>(capacity);

    for (int i = _cssStyleNames.length - 1; i >= 0; i--)
    {
      if (_cssStyleNames[i].length() > 0)
      {
        returnList.add(_cssStyleNames[i]);
      }
    }
    return returnList;
  }

}
