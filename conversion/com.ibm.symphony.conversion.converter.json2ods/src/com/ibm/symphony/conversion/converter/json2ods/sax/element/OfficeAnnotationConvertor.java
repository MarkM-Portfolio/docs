/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.text.OdfTextParagraph;
import org.odftoolkit.odfdom.doc.text.OdfWhitespaceProcessor;
import org.odftoolkit.odfdom.dom.element.dc.DcCreatorElement;
import org.odftoolkit.odfdom.dom.element.office.OfficeAnnotationElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;

public class OfficeAnnotationConvertor extends GeneralConvertor
{
  public void convert(ConversionContext context,Object input,Object output)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    Cell cell = (Cell) input;
    if (cell.comment != null)
    {
      OfficeAnnotationElement odfComment = new OfficeAnnotationElement(contentDom);
      if (ConversionUtil.hasValue(cell.comment.author))
      {
        DcCreatorElement odfCommentCreator = new DcCreatorElement(contentDom);
        odfCommentCreator.setTextContent(cell.comment.author);
        odfComment.appendChild(odfCommentCreator);
      }
      if (ConversionUtil.hasValue(cell.comment.content))
      {
        OdfWhitespaceProcessor textProcessor = new OdfWhitespaceProcessor();
        OdfTextParagraph para = new OdfTextParagraph(contentDom);
        textProcessor.append(para, cell.comment.content);
        odfComment.appendChild(para);
      }
    }
  }
  
}
