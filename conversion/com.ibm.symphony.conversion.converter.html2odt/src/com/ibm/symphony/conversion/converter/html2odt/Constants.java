/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt;

import org.odftoolkit.odfdom.OdfName;

import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class Constants
{
  public static final String SOURCE = "source";
  public static final String TARGET = "target";
  public static final String RESULT = "result";
  public static final String REFMAP = "styleRefMap";
  public static final String CSSMAP = "stylesMap";
  public static final String BODY_CLASS_NAME = "bodyClassName";
  public static final String CONCORD_PAGE_WIDTH = "concordPageWidth";

  public static final String STYLE = "style";
  public static final String CLASS = "class";
  public static final String SPAN = "span";
  public static final String PAGE_BREAK = "page-break-after";
  public static final String CK_PAGE_BREAK = "cke_pagebreak";
  public static final String MARGIN = "margin";
  public static final String OFFICE = "office";
  public static final String FONT_FACE_DECLS = "font-face-decls";
  public static final String DEFAULT_TEXT_STYLE = "Default_20_Text";
  
  public static final String WARNING_ATTRIBUTE = "101";
  public static final String WARNING_ELEMENT = "102";
  public static final String WARNING_STYLE = "103";
  
  public static final String DEFAULT_BULLET_P_NAME = "P_B_Concord_Default";
  public static final String DEFAULT_NUMBER_P_NAME = "P_L_Concord_Default";
  
  public static final String TEMPLATE_STYLE_SOURCE = "html-style-source";
  public static final String TEMPLATE_STYLE_FILE = "smartTable.css"; 
  
  public static final String TEMPLATE_STYLE_HEADING_SOURCE = "html-style-heading-source";
  public static final String TEMPLATE_STYLE_HEADING_FILE = "heading.css";
  
  public static final String TEMPLATE_STYLE_TOC_SOURCE = "html-style-TOC-source";
  public static final String TEMPLATE_STYLE_TOC_FILE = "TOC.css";
  
  public static final String STYLE_DOC_TEMPLATES_SOURCE = "html-style-doctemplates-source";
  public static final String STYLE_DOC_TEMPLATES_FILE = "docTemplates.css";
  
  public static final String BODY_TEMPLATE_STYLE_PREFIX = "concord_Doc_Style_";
  public static final String TABLE_TEMPLATE_STYLE_PREFIX = "STStyle";
  public static final String TABLE_TEMPLATE_SIMPLE_STYLE = "simpleStyle";
  public static final String TABLE_TEMPLATE_STYLE_SEL_CELL = "selectedSTCell";
  public static final String TABLE_HEADER_ROW_CELL = "tableHeaderRow";
  public static final String TABLE_LAST_ROW_CELL = "lastRow";
  public static final String TABLE_ALTER_ROW_CELL = "alternateRow";
  
  public static final OdfName ODF_STYLE_NAME = ConvertUtil.getOdfName(ODFConstants.TEXT_STYLE_NAME);
  public static final String CONCORD_DEFAULT_FONT_STYLE_NAME="Arial";
  
  public static final String DEFAULT_TABLE_BORDER_MODEL = "collapsing";
  
  public static final String PAGE_NUMBER_CLASS = "ODT_PN";
  public static final String DATE_TIME_CLASS = "ODT_DT";
  public static final String TEXT_SEQUENCE_CLASS = "ODT_TS";
  
  public static final String DATE_TIME_FORMAT_CODE = "longdesc";
  public static final String DATE_TIME_STYLE_PREFIX = "DT_STYLE_";
  public static final String DATE_TIME_TYPE_PREFIX = "DT_TYPE_";
  public static final String DATE_TIME_FORMAT_LANG = "lang";
  public static final String DATE_TIME_VALUE = "datetime";
  
  public static final String TEXT_SEQUENCE_OID_PREFIX = "TS_STYLE_";
  
  public static final String TARGET_ROOT_NODE = "odfRoot";
  public static final String HTML_HEADER_ROOT = "htmlHeaderRoot";
  public static final String HTML_FOOTER_ROOT = "htmlFooterRoot";
  public static final String HEADER_DIV = "header_div";
  public static final String FOOTER_DIV = "footer_div";  
  public static final String HEADER_FOOTER = "headerFooter";
  public static final String IMAGESRC_SET = "imageSrcSet";
  public static final String SHAPE_IMAGESRC_SET = "shapeImageSrcSet";
  
  public static final String PARA_FOR_DELETE_PRIFIX = "pForDelete_";
  public static final String PARA_UNDER_DIV_PRIFIX = "pUnderDiv_";
  public static final String PARA_UNDER_DIV = "pUnderDiv";
  public static final String PARA_FOR_DELETE = "pForDelete";
  
  public static final String COMMENT_ID = "commentid";
  public static final String COMMENT_ARRAY = "commentArray";
}
