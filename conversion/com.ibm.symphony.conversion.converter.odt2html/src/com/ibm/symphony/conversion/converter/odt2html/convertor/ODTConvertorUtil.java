/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ODTConvertorUtil
{
  private static final Logger LOG = Logger.getLogger(ODTConvertorUtil.class.getName());

  static JSONArray disabledElements;

  static
  {
    InputStream input = ODTConvertorUtil.class.getResourceAsStream("DisabledElement.json");
    try
    {
      disabledElements = JSONArray.parse(input);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Failed to parse DisabledElement.json.", e);
    }
    finally
    {
      if (input != null)
      {
        try
        {
          input.close();
        }
        catch (IOException e)
        {
        }
      }
    }
  }

  public static HashSet<String> DRAWING_ELEMENTS;
  static
  {
    DRAWING_ELEMENTS = new HashSet<String>();
    DRAWING_ELEMENTS.add("draw:custom-shape");
    DRAWING_ELEMENTS.add("draw:rect");
    DRAWING_ELEMENTS.add("draw:line");
    DRAWING_ELEMENTS.add("draw:polyline");
    DRAWING_ELEMENTS.add("draw:polygon");
    DRAWING_ELEMENTS.add("draw:regular-polygon");
    DRAWING_ELEMENTS.add("draw:path");
    DRAWING_ELEMENTS.add("draw:circle");
    DRAWING_ELEMENTS.add("draw:ellipse");
    DRAWING_ELEMENTS.add("draw:connector");
    DRAWING_ELEMENTS.add("draw:measure");
  }

  public static HashSet<String> FIELD_ELEMENTS;
  static
  {
    FIELD_ELEMENTS = new HashSet<String>();
    // FIELD_ELEMENTS.add("text:date");
    // FIELD_ELEMENTS.add("text:time");
    // FIELD_ELEMENTS.add("text:page-number");
    FIELD_ELEMENTS.add("text:page-continuation");
    FIELD_ELEMENTS.add("text:sender-firstname");
    FIELD_ELEMENTS.add("text:sender-lastname");
    FIELD_ELEMENTS.add("text:sender-initials");
    FIELD_ELEMENTS.add("text:sender-title");
    FIELD_ELEMENTS.add("text:sender-position");
    FIELD_ELEMENTS.add("text:sender-email");
    FIELD_ELEMENTS.add("text:sender-phone-private");
    FIELD_ELEMENTS.add("text:sender-fax");
    FIELD_ELEMENTS.add("text:sender-company");
    FIELD_ELEMENTS.add("text:sender-phone-work");
    FIELD_ELEMENTS.add("text:sender-street");
    FIELD_ELEMENTS.add("text:sender-city");
    FIELD_ELEMENTS.add("text:sender-postal-code");
    FIELD_ELEMENTS.add("text:sender-country");
    FIELD_ELEMENTS.add("text:sender-state-or-province");
    FIELD_ELEMENTS.add("text:author-name");
    FIELD_ELEMENTS.add("text:author-initials");
    FIELD_ELEMENTS.add("text:chapter");
    FIELD_ELEMENTS.add("text:file-name");
    FIELD_ELEMENTS.add("text:template-name");
    FIELD_ELEMENTS.add("text:sheet-name");
    FIELD_ELEMENTS.add("text:variable-decls");
    FIELD_ELEMENTS.add("text:variable-decl");
    FIELD_ELEMENTS.add("text:variable-set");
    FIELD_ELEMENTS.add("text:variable-get");
    FIELD_ELEMENTS.add("text:variable-input");
    FIELD_ELEMENTS.add("text:user-field-decls");
    FIELD_ELEMENTS.add("text:user-field-decl");
    FIELD_ELEMENTS.add("text:user-field-get");
    FIELD_ELEMENTS.add("text:user-field-input");
    // FIELD_ELEMENTS.add("text:sequence-decls");
    // FIELD_ELEMENTS.add("text:sequence-decl");
    FIELD_ELEMENTS.add("text:sequence");
    FIELD_ELEMENTS.add("text:expression");
    FIELD_ELEMENTS.add("text:text-input");
    FIELD_ELEMENTS.add("text:initial-creator");
    FIELD_ELEMENTS.add("text:creation-date");
    FIELD_ELEMENTS.add("text:creation-time");
    FIELD_ELEMENTS.add("text:description");
    FIELD_ELEMENTS.add("text:user-defined");
    FIELD_ELEMENTS.add("text:print-time");
    FIELD_ELEMENTS.add("text:print-date");
    FIELD_ELEMENTS.add("text:printed-by");
    FIELD_ELEMENTS.add("text:title");
    FIELD_ELEMENTS.add("text:subject");
    FIELD_ELEMENTS.add("text:keywords");
    FIELD_ELEMENTS.add("text:editing-cycles");
    FIELD_ELEMENTS.add("text:editing-duration");
    FIELD_ELEMENTS.add("text:modification-time");
    FIELD_ELEMENTS.add("text:modification-date");
    FIELD_ELEMENTS.add("text:creator");
    FIELD_ELEMENTS.add("text:page-count");
    FIELD_ELEMENTS.add("text:paragraph-count");
    FIELD_ELEMENTS.add("text:word-count");
    FIELD_ELEMENTS.add("text:character-count");
    FIELD_ELEMENTS.add("text:table-count");
    FIELD_ELEMENTS.add("text:image-count");
    FIELD_ELEMENTS.add("text:object-count");
    FIELD_ELEMENTS.add("text:meta-field");
    FIELD_ELEMENTS.add("text:execute-macro");
  }

  public static HashSet<String> ALL_DETECTION_ELEMENTS;
  static
  {
    ALL_DETECTION_ELEMENTS = new HashSet<String>();
    ALL_DETECTION_ELEMENTS.add(ODFConstants.TEXT_TRACKED_CHANGES);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.DRAW_OBJECT);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.DRAW_OBJECT_OLE);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.DRAW_PLUGIN);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.TEXT_NOTE);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.TEXT_SECTION);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.OFFICE_ANNOTATION);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.DRAW_CONTROL);
    ALL_DETECTION_ELEMENTS.add(ODFConstants.TEXT_DATABASE_DISPLAY);
    ALL_DETECTION_ELEMENTS.addAll(DRAWING_ELEMENTS);
    ALL_DETECTION_ELEMENTS.addAll(FIELD_ELEMENTS);
  }

  public static HashSet<String> NON_UPGRADED_ELEMENTS;
  static
  {
    NON_UPGRADED_ELEMENTS = new HashSet<String>();
    NON_UPGRADED_ELEMENTS.add(ODFConstants.TEXT_SEQUENCE_DECLS);
    NON_UPGRADED_ELEMENTS.add(ODFConstants.TEXT_SEQUENCE_DECL);
    NON_UPGRADED_ELEMENTS.add(ODFConstants.OFFICE_FORMS);
    NON_UPGRADED_ELEMENTS.add(ODFConstants.OFFICE_TEXT);
    NON_UPGRADED_ELEMENTS.add(ODFConstants.TEXT_S);
    NON_UPGRADED_ELEMENTS.add(ODFConstants.TEXT_SPAN);
    NON_UPGRADED_ELEMENTS.add(ODFConstants.TEXT_P);
    NON_UPGRADED_ELEMENTS.addAll((List<String>) disabledElements);
  }

  public static JSONArray getDisabledElements()
  {
    return disabledElements;
  }

  public static Node getChildNodeById(Node parent, String id)
  {
    Node child = null;
    if (parent.hasChildNodes())
    {
      NodeList childs = parent.getChildNodes();
      for (int i = 0; i < childs.getLength(); i++)
      {
        child = childs.item(i);
        if (child instanceof Element)
        {
          String childId = ((Element) child).getAttribute("id");
          if (childId != null && childId.equals(id))
            return child;
        }
      }
    }
    return null;
  }

  public static OdfFileDom getCurrentFileDom(ConversionContext context)
  {
    try
    {
      if (context.get("contentRootNode").equals(ODFConstants.OFFICE_TEXT))
        return ((OdfDocument) context.get("source")).getContentDom();
      else
        return ((OdfDocument) context.get("source")).getStylesDom();
    }
    catch (Exception e)
    {

    }
    return null;
  }

  public static OdfOfficeAutomaticStyles getCurrentAutoStyles(ConversionContext context)
  {
    OdfFileDom fileDom = getCurrentFileDom(context);
    if (fileDom != null)
      return fileDom.getAutomaticStyles();

    return null;
  }
}
