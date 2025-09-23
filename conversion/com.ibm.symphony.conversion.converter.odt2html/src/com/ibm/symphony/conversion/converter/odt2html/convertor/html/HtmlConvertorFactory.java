/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.converter.odt2html.convertor.ODTConvertorUtil;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class HtmlConvertorFactory implements IConvertorFactory
{

  private static HtmlConvertorFactory instance = new HtmlConvertorFactory();

  private static final IConvertor GENERAL_CONVERTOR = new GeneralHtmlConvertor();

  private static Map<String, IConvertor> convertorMap = new HashMap<String, IConvertor>();
  static
  {
    convertorMap.put(ODFConstants.TEXT_P, new ParagraphConvertor());
    convertorMap.put(ODFConstants.TABLE_TABLE, new TableConvertor());
    convertorMap.put(ODFConstants.TABLE_TABLE_ROW, new TableRowConvertor());
    convertorMap.put(ODFConstants.TABLE_TABLE_COLUMN, new TableColGroupConvertor());    
    convertorMap.put(ODFConstants.TABLE_TABLE_CELL, new TableCellConvertor()); 
    convertorMap.put(ODFConstants.DRAW_IMAGE, new ImageConvertor());
    convertorMap.put(ODFConstants.DRAW_FRAME, new DrawFrameConvertor());
    convertorMap.put(ODFConstants.DRAW_TEXT_BOX, new DrawTextboxConvertor());
    IConvertor listItemConvertor = new ListItemConvertor();
    convertorMap.put(ODFConstants.TEXT_LIST_ITEM, listItemConvertor);
    convertorMap.put(ODFConstants.TEXT_LIST_HEADER, listItemConvertor);
    
    convertorMap.put(ODFConstants.TEXT_LIST, new ListConvertor());
    convertorMap.put(ODFConstants.SVG_TITLE, new SVGTitleConvertor());
    convertorMap.put(ODFConstants.TEXT_H, new HeadingConvertor());
    convertorMap.put(ODFConstants.TEXT_TABLE_OF_CONTENT, new TOCConvertor());
    IConvertor anchorConvertor = new AnchorConvertor();
    convertorMap.put(ODFConstants.TEXT_A, anchorConvertor);
    convertorMap.put(ODFConstants.DRAW_A, anchorConvertor);
    IConvertor bookmarkConvertor = new BookmarkConvertor();
    convertorMap.put(ODFConstants.TEXT_BOOKMARK, bookmarkConvertor);
    convertorMap.put(ODFConstants.TEXT_BOOKMARK_START, bookmarkConvertor);
    convertorMap.put(ODFConstants.TEXT_BOOKMARK_REF, bookmarkConvertor);
    convertorMap.put(ODFConstants.TEXT_BOOKMARK_END, bookmarkConvertor);
    convertorMap.put(ODFConstants.TEXT_SPAN, new SpanConvertor());
    convertorMap.put(ODFConstants.TEXT_S, new SpaceConvertor());
    convertorMap.put(ODFConstants.TEXT_TAB, new TabConvertor());
    convertorMap.put(ODFConstants.TEXT_INDEX_TITILE, new TextIndexTitleConvertor());
    convertorMap.put(ODFConstants.TEXT_PAGE_NUMBER, new PageNumberConvertor());
    convertorMap.put(ODFConstants.TEXT_DATE, new DateTimeConvertor());
    convertorMap.put(ODFConstants.TEXT_TIME, new DateTimeConvertor());
    convertorMap.put(ODFConstants.TEXT_LINE_BREAK, new LineBreakConvertor());
    convertorMap.put(ODFConstants.TEXT_SEQUENCE, new TextSequenceConvertor());
    IConvertor shapeConvertor = new ShapeConvertor();
    convertorMap.put(ODFConstants.DRAW_LINE,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_CONNECTOR,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_CUSTOMSHAPE,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_ELLIPSE,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_MEASURE,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_RECT,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_PATH,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_G,new GroupShapeConvertor());
    convertorMap.put(ODFConstants.DRAW_POLYGON,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_POLYLINE,shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_REGULAR_POLYGON,shapeConvertor);
    convertorMap.put(ODFConstants.DR3D_SCENE,shapeConvertor);
    convertorMap.put(ODFConstants.TEXT_SECTION,new SectionConvertor());
    convertorMap.put(ODFConstants.TEXT_TABLE_OF_CONTENT_ENTRY_TEMPLATE,new TOCEntryTemplateConvertor());
    
    IConvertor emptyConvertor = new EmptyHtmlConvertor();
    
    List<String> disabledElements = ODTConvertorUtil.getDisabledElements();
    for(int i=0;i<disabledElements.size();i++)
    {
      convertorMap.put( disabledElements.get(i), emptyConvertor);
    }
  }

  public static IConvertorFactory getInstance()
  {
    return instance;
  }

  public IConvertor getConvertor(Object input)
  {
    OdfElement element = (OdfElement) input;
    IConvertor convertor = convertorMap.get(element.getNodeName());
    if (convertor == null)
      convertor = GENERAL_CONVERTOR;
    return convertor;
  }
}
