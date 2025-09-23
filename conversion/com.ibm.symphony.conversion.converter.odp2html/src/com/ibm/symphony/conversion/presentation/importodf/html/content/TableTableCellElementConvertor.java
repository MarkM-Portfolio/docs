/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.attribute.style.StyleNameAttribute;
import org.odftoolkit.odfdom.dom.element.table.TableCoveredTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.StackableProperties;
import com.ibm.symphony.conversion.presentation.importodf.TableTemplateCssUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.presentation.model.TableIndex;

public class TableTableCellElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = TableTableCellElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @SuppressWarnings("unchecked")
  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    double oldParent = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    String oldCellWidth = (String) context.get(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH);

    TableIndex index = (TableIndex) context.get(ODPConvertConstants.CONTEXT_TABLE_INDEX);
    JSONObject templateMap = (JSONObject) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_MAP);
    Map<String, String> templateAttrs = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_ATTRS);

    index.increaseYIndex(1);

    if (element instanceof TableCoveredTableCellElement)
    {
      // Apply any covered cell style to the table cell with the row or column covered.
      applyCoveredCellStyle(context, element, index);
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParent);
      return;
    }

    if (index.isCovered())
      return;

    // parse current Node.
    Element htmlElement = addHtmlElement(element, htmlParent, context);

    // update the merged cells information
    Integer colSpan = ((TableTableCellElement) element).getTableNumberColumnsSpannedAttribute();
    Integer rowSpan = ((TableTableCellElement) element).getTableNumberRowsSpannedAttribute();
    index.setCoveredTable(rowSpan, colSpan, htmlElement);

    // parse attributes.
    htmlElement = parseAttributes2(element, htmlElement, context);

    setTableColumnWidth(context, element, htmlElement);
    
    htmlElement.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_GRIDCELL);

    if (templateMap != null)
    {
      //
      // Build up the names of the css styles that we will use for this cell when a table template is defined for it.
      // Because the table template styles may contain font sizes (Symphony 1.3 allowed for this, but not Symphony 3),
      // we need to parse through them, in the right order, to set the context parent size.
      //
      // We also add some "special" names to the <td> class list for table template column attributes, so the editor
      // knows about it, (i.e. "lastCol", "tableHeaderCol", "alternateCol").
      //
      // NOTE: we are not adding the css style names to the <td> class list because css selectors will pick them up
      // automatically (based on the table-template-name being in the <table> class list, and the css selectors we created
      // when parsing the <table:template-name> cell styles).
      //

      String tableTemplateName = templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLETEMPLATE_NAME);

      TableTemplateCssUtil templateCssStyles = new TableTemplateCssUtil();

      StringBuilder tableClass = new StringBuilder(128); // for new class attribute
      try
      {
        OdfStyle tableCellDS = ((OdfDocument) context.getSource()).getStylesDom().getOfficeStyles()
            .getStyle(ODPConvertConstants.DEFAULT, OdfStyleFamily.TableCell);
        String defaultTemplateStyleName = tableCellDS.getOdfAttributeValue(StyleNameAttribute.ATTRIBUTE_NAME);
        templateCssStyles.addCellStyle(tableTemplateName, defaultTemplateStyleName);
      }
      catch (Exception e)
      {
      }

      // always add table:body css style to the style name list
      templateCssStyles.addCellStyle(tableTemplateName, ODPConvertConstants.ODF_ELEMENT_TABLEBODY);

      if (index.isFirstRow() && Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_FIRST_ROW_STYLES)))
      {
        templateCssStyles.addCellStyle(tableTemplateName, ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_ROW);
        
        if (index.isLastColumn() && Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_LAST_COLUMN_STYLES)))
        {
        	// keep role=gridcell for the top cell of the summary column (that's not a columnheader since 
        	// ODF precedence puts summary column ahead of total row)
        }
        else 
        {
        	htmlElement.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_COLUMNHEADER);
        }
      }
      else if (index.isLastRow() && Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_LAST_ROW_STYLES)))
      {
        templateCssStyles.addCellStyle(tableTemplateName, ODPConvertConstants.ODF_ELEMENT_TABLELAST_ROW);
      }

      if (Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_BANDING_ROWS_STYLES)) && index.isOddRow())
      {
        templateCssStyles.addCellStyle(tableTemplateName, ODPConvertConstants.ODF_ELEMENT_TABLEODD_ROWS);
      }

      if (index.isFirstColumn() && Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_FIRST_COLUMN_STYLES)))
      {
        tableClass.append(ODPConvertConstants.CSS_TABLE_HEADER_COLUMN);
        tableClass.append(ODPConvertConstants.SYMBOL_WHITESPACE);

        templateCssStyles.addCellStyle(tableTemplateName, ODPConvertConstants.ODF_ELEMENT_TABLEFIRST_COLUMN);
        
        // When we have a "first column", set "role=rowheader
        htmlElement.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_ROWHEADER);
      }
      else if (index.isLastColumn() && Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_LAST_COLUMN_STYLES)))
      {
        tableClass.append(ODPConvertConstants.CSS_TABLE_LAST_COLUMN);
        tableClass.append(ODPConvertConstants.SYMBOL_WHITESPACE);

        templateCssStyles.addCellStyle(tableTemplateName, ODPConvertConstants.ODF_ELEMENT_TABLELAST_COLUMN);

      }

      if (Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_BANDING_COLUMNS_STYLES)))
      {
        if (index.isOddColumn())
        {
          tableClass.append(ODPConvertConstants.CSS_TABLE_ALTERNATE_COLUMN);
          tableClass.append(ODPConvertConstants.SYMBOL_WHITESPACE);

          templateCssStyles.addCellStyle(tableTemplateName, ODPConvertConstants.ODF_ELEMENT_TABLEODD_COLUMNS);
        }
      }

      String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if (tableClass.length() > 0)
      {
        if (classAttr != null && classAttr.length() > 0)
        {
          tableClass.insert(0, classAttr);
        }
        htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, tableClass.toString());
      }

      // mich/ron - defect 9248, sets the font size in the context if it comes from a style other than the table:style-name
      // attribute of the table:table-cell element
      boolean foundFontSize = false;

      // if classAttr contains a style that defines a font-size, it takes precedence
      // NOTE: we only want to go thru the original classes that were on the <td> before
      // we added the table classes - we'll go thru the templates later if we don't find
      // style on the class list that contains a fontsize

      List<String> styleNames = getClassStyleNames(context, htmlElement, classAttr);
      for (String styleName : styleNames)
      {
        Map<String, String> styleMap = CSSConvertUtil.getStyleMap(context, styleName.toString());
        if (styleMap != null && styleMap.containsKey(ODPConvertConstants.CSS_FONT_SIZE))
        {
          // no need to set the font size in the context, this one is already done by the parseClassAttribute method
          foundFontSize = true;
          break;
        }
      }

      // if no font size could be found in classAttr, look in table template styles
      if (!foundFontSize)
      {
        // get css template style names active for this cell (already in precedence order)
        ArrayList<String> styleNamesList = templateCssStyles.getCssStyleNames();
        for (String styleName : styleNamesList)
        {
          foundFontSize = setTemplateFontSize(context, styleName, oldParent);

          if (foundFontSize)
            break;
        }
      }

    }

    // find out if we are holding the text color from the cell. Note: we don't need to worry about
    // recovering the color property during export. Turns out the export code doesn't care if style
    // properties are ignored by the import code (i.e. not copied into the CSS style) - the original
    // color will be copied back into any new style (if one is created).

    String pushedCellColor = null, autoCellColor = null;
    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
    if (sp != null)
    {
      pushedCellColor = sp.getValue(ODPConvertConstants.HTML_ATTR_CELL_COLOR).getValue();
      autoCellColor = sp.getValue(ODPConvertConstants.HTML_ATTR_CELL_AUTO_COLOR).getValue();
    }

    // if we are holding the color we need to create a placeholder p element so that the color style
    // can be propagated to the editor. Add a couple of attributes to help export processing. First
    // add the cell-text-color (for a pushed cell color) - this way on export we know if the in-line
    // style can be discarded if it matches. For an auto color, mark that too for the same reason.
    // Also, add the removal candidate flag - on export we can delete this element and its children
    // however it will have to be checked first to see if there's any user-added text.

    NodeList clist = element.getChildNodes();
    if (clist.getLength() == 0)
    {
      boolean pushedColorNode = (pushedCellColor != null || autoCellColor != null);
      
      String placeHolderFlag = ODPConvertConstants.HTML_ATTR_AUTO_COLOR, colorValue = autoCellColor;

      if (pushedCellColor != null)
      {
        placeHolderFlag = ODPConvertConstants.HTML_ATTR_CELL_COLOR;
        colorValue = pushedCellColor;
      }

      Document doc = (Document) context.getTarget();
      Element pn = createHtmlElementWithoutIndexing(context, doc, ODPConvertConstants.HTML_ELEMENT_P);

      pn.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_CLASS_TEXT_P + " "
          + ODPConvertConstants.HTML_ATTR_SPACE_PLACEHOLDER);

      pn.setAttribute(ODPConvertConstants.HTML_ATTR_REMOVAL_CANDIDATE, "1");

      if (pushedColorNode)
      {
        pn.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.CSS_FONT_COLOR + ": " + colorValue);
        pn.setAttribute(placeHolderFlag, colorValue);
      }

      htmlElement.appendChild(pn);

      Element span = createHtmlElementWithoutIndexing(context, doc, ODPConvertConstants.HTML_ELEMENT_SPAN);
      //set font-size on default table cell
      double currentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
      span.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.CSS_FONT_SIZE + ": " + currentSize/18 +"em");
      if(currentSize!=18.0)
    	  span.setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOM_STYLE, ODPConvertConstants.CSS_ABS_FONT_SIZE + ": " + currentSize);
      pn.appendChild(span);

      Node t = doc.createTextNode(ODPConvertConstants.STRING_8203);
      span.appendChild(t);
      
      if (!pushedColorNode)
      {
        Element brElement = doc.createElement(ODPConvertConstants.HTML_ELEMENT_BR);
        brElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HIDE_IN_IE);
        pn.appendChild(brElement);
      }
    }
    else
    {
    	TextListChildElementConvertor.initCounter();
      // parse Children.
      this.convertChildren(context, element, htmlElement);
    }

    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParent);
    context.put(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH, oldCellWidth);
    context.remove(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP);
    context.remove(ODPConvertConstants.CONTEXT_LIST_OUTLINE_STYLE_NAME);
    context.remove(ODPConvertConstants.CONTEXT_TEXTLIST_START_VALUE);
  }

  /**
   * Returns a list of style names from the class attribute, in order of css style effective precedence in the scope of table cells.
   * 
   * @param context
   *          - the current conversion context
   * @param htmlElement
   *          - current html element being exported
   * @param classAttr
   *          - string containing class names
   * 
   * @return the list of style names
   */
  private List<String> getClassStyleNames(ConversionContext context, Element htmlElement, String classAttr)
  {
    String[] classAttrValues = classAttr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
    String tableCellStyleName = "";

    // First, get the cell style name which is first in order of specificity
    int nbrStyles = classAttrValues.length;
    int capacity = ODPCommonUtil.calculateArrayCapacity(nbrStyles);
    ArrayList<String> styleNames = new ArrayList<String>(capacity);

    if (nbrStyles > 1)
    {
      for (int i = 0; i < nbrStyles; i++)
      {
        // assume our cell style is the first one after "table_table-cell"
        if (classAttrValues[i].equals(ODPConvertConstants.HTML_ATTR_TABLE_CELL))
        {
          if (nbrStyles > i) // make sure there is a table cell style after the table_table-cell
          {
            // This one has a css selector as part of the name
            tableCellStyleName = classAttrValues[i + 1]; // save this name so we know we've added it
            styleNames.add(ODPConvertConstants.CSS_TABLE_CELL_SELECTOR + tableCellStyleName);
          }
          break;
        }
      }
  
      // now loop thru the styles one more time, in reverse order, adding the other styles
      // (assuming the classes are listed in order of specificity)
      for (int i = nbrStyles - 1; i > 0; i--)
      {
        if (!classAttrValues[i].equals(ODPConvertConstants.HTML_ATTR_TABLE_CELL) && !classAttrValues[i].equals(tableCellStyleName))
        {
          styleNames.add(classAttrValues[i]);
  
        }
      }
    }

    return styleNames;

  }

  /**
   * Get the font size for a given table template style name and set the context parent size to it.
   * 
   * @param context
   *          - the current conversion context
   * @param styleName
   *          - the template style name to get the font size for
   * 
   * @return true if we set a new font size
   */
  @SuppressWarnings("unchecked")
  private boolean setTemplateFontSize(ConversionContext context, String styleName, double oldParentFS)
  {

    boolean foundFS = false;

    // set the style map for office_styles.css
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);
    if (styles != null)
    {
      Map<String, String> styleMap = styles.get(styleName);

      if (styleMap != null)
      {
        String fontSize = styleMap.get(ODPConvertConstants.CSS_FONT_SIZE);
        if (fontSize != null)
        {

          // TODO: (rhaugen) this isn't quite right because we're using the EM value calculated when the
          // table:template-style was created during master style processing. However, during content.html
          // processing, our parent could be a different font size than when the template style was originally created
          // NEED LOTS OF WORK to build the template styles in content, but we're not doing that right now and nor
          // does Symphony allow custom table templates any more (only Symphony 1.3 had font-sizes in table templates)
          double fontSize_d = Measure.extractNumber(fontSize);
          if (oldParentFS == 0.0)
            fontSize_d *= ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT;
          else
            fontSize_d *= oldParentFS;

          context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, fontSize_d);
          foundFS = true;
        }
      }
    }

    return foundFS;
  }

  @SuppressWarnings({ "restriction", "unchecked" })
  private void setTableColumnWidth(ConversionContext context, Node element, Element htmlElement)
  {
    String result = "0%";
    OdfElement parent = (OdfElement) element.getParentNode().getParentNode();
    if (parent instanceof TableTableElement)
    {
      Integer colSpan = ((TableTableCellElement) element).getTableNumberColumnsSpannedAttribute();
      NodeList children = parent.getChildNodes();
      TableIndex index = (TableIndex) context.get(ODPConvertConstants.CONTEXT_TABLE_INDEX);
      // OdfDocument dom = (OdfDocument) context.getSource();
      int col_index = index.getY();
      for (int i = 0; i < colSpan; i++)
      {
        Node node = children.item(col_index + i);
        if (node instanceof TableTableColumnElement)
        {
          TableTableColumnElement column = (TableTableColumnElement) node;

          Map<String, Map<String, String>> contentStyles = (Map<String, Map<String, String>>) context
              .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
          if(contentStyles != null)
          {	  
            String styleName = CSSConvertUtil.getStyleName(column.getTableStyleNameAttribute());
            Map<String, String> map = contentStyles.get(styleName);
            if ((map != null) && map.containsKey(ODPConvertConstants.SVG_ATTR_WIDTH))
            {
              String value = map.get(ODPConvertConstants.SVG_ATTR_WIDTH);
              result = plusPercentage(result, value);
            }
          }
        }
      }
      //htmlElement.setAttribute(ODPConvertConstants.SVG_ATTR_WIDTH, result);
    }

    context.put(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH, result);

  }

  /**
   * Apply a covered cell style to the cell containing the row or column that is spanning this covered cell style if on the last row or
   * column of the table.
   * 
   * Note: Only apply the cover cell style if we are on the last row or column. Other rows and columns should already have border applied in
   * the correct positions and applying additional borders can lead to loss of a border. If in the future, we need to apply to other cells,
   * we will need to merge the styles into a new style (or move inline).
   * 
   * @param context
   *          - the current ConversionContext
   * @param coveredTableCellElement
   *          - the table:covered-table-cell element
   * @param index
   *          - the table index
   */
  private void applyCoveredCellStyle(ConversionContext context, Node coveredTableCellElement, TableIndex index)
  {
    TableCoveredTableCellElement coveredCell = (TableCoveredTableCellElement) coveredTableCellElement;
    String tableStyleName = coveredCell.getTableStyleNameAttribute();
    if (tableStyleName == null || tableStyleName.length() == 0)
      return;

    if (index.isLastRow() || index.isLastColumn())
    {
      List<Node> classList = getClassElements(coveredTableCellElement, (OdfDocument) context.getSource(), context);
      if (classList != null && !classList.isEmpty())
      {
        // Process the class info - this will also create the css for the covered cells style.
        String classInfo = parseClassAttribute(classList, null, null, context);
        // Update the class info on the covered cell's original class (the cell with the row or span covering
        // this covered cell).
        if (index.isCovered())
        {
          Element htmlElement = index.getCoveredTableCellElement();
          if (htmlElement != null)
          {
            String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
            if (classAttr != null && classInfo.length() > 0)
              htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classAttr + classInfo);
          }
        }
      }
    }
  }

  private String plusPercentage(String p1, String p2)
  {
    if (!p1.endsWith(Measure.PERCENT) || !p2.endsWith(Measure.PERCENT))
      return null;
    double dp1 = Double.parseDouble(p1.substring(0, p1.length() - 1));
    double dp2 = Double.parseDouble(p2.substring(0, p2.length() - 1));
    return dp1 + dp2 + Measure.PERCENT;
  }

}
