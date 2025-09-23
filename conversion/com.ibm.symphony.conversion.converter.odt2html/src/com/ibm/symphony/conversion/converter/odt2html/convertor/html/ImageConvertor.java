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

import java.io.File;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.odt2html.ODT2HTMLConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.image.ImageUtil;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ImageConvertor extends HtmlConvertor
{
  public static Set<String> formatsCvt = new HashSet<String>();

  Logger log = Logger.getLogger(ImageConvertor.class.getName());

  static Map<String, String> formatMimeTypeMap = new HashMap<String, String>();
  static
  {

    formatMimeTypeMap.put("wmf", "application/x-msmetafile");
    formatMimeTypeMap.put("emf", "application/x-msmetafile");
    formatMimeTypeMap.put("tif", "application/x-msmetafile");
    formatMimeTypeMap.put("svm", "image/svm");

    formatsCvt.addAll(formatMimeTypeMap.keySet());
  }

  static final int NO_CONVERT = 0;

  static final int CONVERT = 1;

  static final int CONVERT_FAILED = 2;

  private int processFormatConvert(ConversionContext context, final String extName)
  {
    if (formatsCvt.contains(extName))
    {
      // needs to convert
      return CONVERT;
    }
    else
    {
      if (ConvertUtil.noCvtFormats.contains(extName))
      {
        return NO_CONVERT;
      }
      else
      {
        return CONVERT_FAILED;
      }
    }
  }

  private static class ConvertResult
  {
    boolean createPlaceHolder;

    String msg;

    ConvertResult(boolean createPlaceHolder, String msg)
    {
      this.createPlaceHolder = createPlaceHolder;
      this.msg = msg;
    }
  }

  private void submitConversionTask(final ConversionContext context, final String fileFullName, final int width, final int height,
      final Element img)
  {
    final File file = new File(fileFullName);
    String fileName = file.getName();
    int dotIndex = fileName.lastIndexOf(".");

    final String fileNewName = fileName.substring(0, dotIndex) + ".png";
    final String extName = fileFullName.substring(fileFullName.lastIndexOf(".") + 1).toLowerCase();

    final Future<?> future = context.getTask(fileFullName);

    if (future == null)
    {
      Callable<ConvertResult> task = new Callable<ConvertResult>()
      {
        public ConvertResult call()
        {
          boolean createPlaceHolder = false;
          String msg = null;
          final Map<String, Object> param = new HashMap<String, Object>();
          param.put("width", width);
          param.put("height", height);
          param.put("targetName", fileNewName);

          ConversionResult rst = null;
          try
          {
            IConversionService conversionService = ConversionService.getInstance();
            IFormatConverter convertor = conversionService.getConverter(formatMimeTypeMap.get(extName), ConversionConstants.PNG_MIMETYPE);
            File subFile = new File(file.getParentFile().getAbsolutePath() + File.separator + extName);
            if (!subFile.exists())
              subFile.mkdir();
            rst = convertor.convert(file, subFile, param);
            log.info("Is image converted succed? " + rst.isSucceed());
            createPlaceHolder = !rst.isSucceed();
          }
          catch (Throwable th)
          {
            // th.printStackTrace();
            log.log(Level.INFO, th.getMessage(), th);
            createPlaceHolder = true;
          }
          finally
          {
            file.delete();
          }

          if (createPlaceHolder)
          {
            msg = "Unsupported content: "+extName;
            ConvertUtil.createPlaceHolder(context, img, true, msg);
          }

          return new ConvertResult(createPlaceHolder, msg);
        }
      };

      context.addTask(fileFullName, task);
    }
    else
    {
      ConvertResult rst;
      try
      {
        rst = (ConvertResult) future.get();
      }
      catch (Exception e)
      {
        log.log(Level.INFO, e.getMessage(), e);
        rst = new ConvertResult(true, "Unsupported content");
      }
      if (rst.createPlaceHolder)
      {
        ConvertUtil.createPlaceHolder(context, img, true, rst.msg);
      }
      else
      {
        String path = "Pictures/" + extName + "/" + fileNewName;
        HtmlConvertorUtil.setAttribute(img,HtmlCSSConstants.SRC, path);
        HtmlConvertorUtil.setAttribute(img,HtmlCSSConstants.CKE_SAVED_SRC, path);
      }
    }
  }

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    String imageSrc = element.getAttribute(ODFConstants.XLINK_HREF);
    String extName = imageSrc.substring(imageSrc.lastIndexOf(".") + 1).toLowerCase();
    int rst = processFormatConvert(context, extName);
    if(rst != CONVERT_FAILED)
      imageSrc = HtmlConvertorUtil.updateImageDirAndCopyImageToDraftFolder(context, imageSrc, element);
    String fileFullName = context.get("targetFolder") + File.separator + imageSrc;
    
    OdfElement drawFrame = DrawFrameConvertor.getDrawFrame(element);
    int width = (int) (0.5 + 2 * Double.parseDouble(getWidth(drawFrame)));
    int height = (int) (0.5 + 2 * Double.parseDouble(getHeight(drawFrame)));  

    Element htmlNode;
    htmlNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.IMG);
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
    HtmlConvertorUtil.setAttribute(htmlNode,"_type", "image",false);
    if (rst == CONVERT)
    {
      String fileName = imageSrc.substring(9);
      int dotIndex = fileName.lastIndexOf(".");
      String fileNewName = fileName.substring(0, dotIndex) + ".png";
      String path = "Pictures/" + extName + "/" + fileNewName;
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.SRC, path);
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CKE_SAVED_SRC, path);

      submitConversionTask(context, fileFullName, width, height, htmlNode);
    }
    else
    {
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.SRC, imageSrc);
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CKE_SAVED_SRC, imageSrc);
    }
    
    if(GroupShapeConvertor.isUnderGroup(context))
    {
      element.removeAttribute("id");
      String imageAttribute[] = DrawFrameConvertor.getImageAttribute(context, drawFrame);
      String zIndex = getGroupZIndex(drawFrame);
      boolean isExist = true;
      if (rst == CONVERT)
        isExist = false;
      ImageUtil.addToImageList(context, imageAttribute[0], imageAttribute[1], imageAttribute[2], imageAttribute[3], zIndex, imageSrc, isExist);
      DrawFrameConvertor.parseStyle(context, drawFrame, htmlNode, parent, element, false);
      return;
    }
    
    OdfElement drawA = (OdfElement) drawFrame.getParentNode();
    if (ODFConstants.DRAW_A.equals(drawA.getNodeName()))
    {
      Element a = context.getOdfToHtmlIndexTable().createHtmlElement(drawA, doc, HtmlCSSConstants.A);
      AnchorConvertor convertor = new AnchorConvertor();
      convertor.convertAttributes(context, drawA, a);
      parent.appendChild(a);
      a.appendChild(htmlNode);
    }
    else
      parent.appendChild(htmlNode);
    

    OdfElement parentElement = (OdfElement) element.getParentNode();

    String anchorType = parentElement.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
    String zIndex = parentElement.getAttribute("draw:z-index");

    OdfToHtmlIndex indexTable = context.getOdfToHtmlIndexTable();
    if (!indexTable.isOdfNodeIndexed(drawFrame))
      HtmlConvertorUtil.addEntryByOdfNode(context, drawFrame, htmlNode);

    DrawFrameConvertor.parseStyle(context, drawFrame, htmlNode, parent, element, false);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, drawFrame.getAttribute(ODFConstants.DRAW_STYLE_NAME));
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.NAME, drawFrame.getAttribute(ODFConstants.DRAW_NAME));
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.ALT, "");
//    setAnchor(context, element, parent, isGrouped, drawFrame, htmlNode, anchorType, zIndex);

    if (rst == CONVERT_FAILED)
    {
      ConvertUtil.createPlaceHolder(context, htmlNode, true, "Unsupported content");
    }

  }
  public static boolean isGrouped(OdfElement parentElement, boolean isGrouped, Element htmlNode)
  {
    if (parentElement.getParentNode().getNodeName().equals(ODFConstants.DRAW_G))
    {
      isGrouped = true;
    }
    return isGrouped;
  }

  public static void setGroupAttribute(OdfElement parentElement, Element htmlNode)
  {
    NamedNodeMap attributes = parentElement.getAttributes();
    Node attr = attributes.getNamedItem("draw:style-name");
    String value = attr.getNodeValue();
    value += " group";
    HtmlConvertorUtil.setAttribute(((Element) htmlNode.getParentNode()),"class", value);
    HtmlConvertorUtil.setAttribute(htmlNode,"_type", "group",false);
    String _type = ((Element) htmlNode.getParentNode()).getAttribute("_type");
    if(_type != null && !_type.equals(""))
      HtmlConvertorUtil.setAttribute(((Element) htmlNode.getParentNode()),"_type",_type +" group",false);
    else
    {
      Logger log = Logger.getLogger(ODT2HTMLConverter.class.getName());
      log.warning("The _type of the draw frame div is null, it should be 'drawframe'");
    }
  }

 
  
  public static String getGroupZIndex(OdfElement drawFrame)
  {
    String zIndex = drawFrame.getAttribute(ODFConstants.DRAW_Z_INDEX);
    if (zIndex.length() == 0)
    {
      OdfElement drawG = (OdfElement) drawFrame.getParentNode();
      while (ODFConstants.DRAW_G.equals(drawG.getNodeName()))
      {
        zIndex = drawG.getAttribute(ODFConstants.DRAW_Z_INDEX);
        if (zIndex.length() != 0)
        {
          return zIndex;
        }
        drawG = (OdfElement) drawG.getParentNode();
      }
    }
    
    return zIndex;
  }

  

  private static String getWidth(OdfElement drawFrame)
  {
    String width = drawFrame.getAttribute(ODFConstants.SVG_WIDTH);
    String value = ConvertUtil.convertUnitToPT(width);
    value = value.substring(0, value.length() - 2);
    return value;
  }

  private static String getHeight(OdfElement drawFrame)
  {
    String height = drawFrame.getAttribute(ODFConstants.SVG_HEIGHT);
    String value = ConvertUtil.convertUnitToPT(height);
    value = value.substring(0, value.length() - 2);
    return value;
  }

  

 
}
