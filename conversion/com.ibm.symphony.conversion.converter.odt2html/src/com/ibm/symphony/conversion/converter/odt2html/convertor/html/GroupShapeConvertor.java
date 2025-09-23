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

import java.awt.Image;
import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import org.w3c.dom.NodeList;
import symphony.org.w3c.tidy.DomUtil;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.image.ImageDescriptor;
import com.ibm.symphony.conversion.service.common.image.ImageUtil;
import com.ibm.symphony.conversion.service.common.util.OdfElementUtil;

public class GroupShapeConvertor extends HtmlConvertor
{

  Logger log = Logger.getLogger(GroupShapeConvertor.class.getName());

  static final int NO_CONVERT = 0;

  static final int CONVERT = 1;

  static final int CONVERT_FAILED = 2;

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    boolean isTopDrawG = false;
    Node locationDiv = null;
    Node objNode = null;
    if (context.get("GroupImageList") == null)
    {
      isTopDrawG = true;
      List<ImageDescriptor> imageList = new ArrayList<ImageDescriptor>();
      context.put("GroupImageList", imageList);
      String anchorType = element.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
      if(!anchorType.equals("page"))
      {
        // One top div could just has one location div
        locationDiv = parent.getLastChild();
        while (locationDiv != null)
        {
          if ("div".equals(locationDiv.getNodeName()) && ((Element) locationDiv).getAttribute("_type").indexOf(HtmlCSSConstants.LOCATIONDIV) != -1)
          {
            objNode = locationDiv.getLastChild();
            break;
          }
          locationDiv = locationDiv.getPreviousSibling();
        } 
      }
    }

    HtmlConvertorUtil.convertChildren(context, element, parent);

    if (isTopDrawG)
    {
      List<ImageDescriptor> imageList = (List<ImageDescriptor>) context.remove("GroupImageList");
      if (imageList.isEmpty())
        return;
      String bigImageName = "image_" + UUID.randomUUID().toString().substring(0, 4) + ".png";
      ImageDescriptor bigImageDescriptor = ImageUtil.calcBigImageInfo(imageList);
      groupShapes(context, bigImageName, bigImageDescriptor, imageList);

      Element img = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.IMG);
      int width = bigImageDescriptor.getWidth();
      int height = bigImageDescriptor.getHeight();
      String zIndex = element.getAttribute(ODFConstants.DRAW_Z_INDEX);
      if(zIndex == null || "".equals(zIndex))
        zIndex = "0";
      StringBuilder style = new StringBuilder();
      style.append("z-index:").append(zIndex).append(";height:").append(pixelTocm(height)).append(";width:").append(pixelTocm(width)).append(";");
      String anchorType = element.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
//      if ("as-char".equals(anchorType) && !parent.getNodeName().equals(HtmlCSSConstants.DIV))
//      {
//        parent.appendChild(img);
//      }
//      else
//      {
        if (locationDiv == null)
        {
          locationDiv = parent.getLastChild();
          while (locationDiv != null)
          {
            if (HtmlCSSConstants.DIV.equals(locationDiv.getNodeName()) && ((Element) locationDiv).getAttribute("_type").indexOf(HtmlCSSConstants.TOPDIV) != -1)
            {
              parent = (Element)locationDiv;
              locationDiv = parent.getLastChild();
            }
            if (HtmlCSSConstants.DIV.equals(locationDiv.getNodeName()) && ((Element) locationDiv).getAttribute("_type").indexOf(HtmlCSSConstants.LOCATIONDIV) != -1)
              break;

            locationDiv = locationDiv.getPreviousSibling();
          }
        }
        if (locationDiv != null)
        {
          if (objNode == null)
          {
            objNode = locationDiv.getFirstChild();
          }
          else
          {
            objNode = objNode.getNextSibling();
          }

          if (objNode == null&&locationDiv.getChildNodes().getLength()==0)
          {
            if ("as-char".equals(anchorType))
            {
              parent.removeChild(locationDiv);
              parent.appendChild(img);
            }
            else
            {

              if (parent.getNodeName().equals(HtmlCSSConstants.P) || parent.getNodeName().equals(HtmlCSSConstants.SPAN))
              {
                DomUtil.setElementName(parent, HtmlCSSConstants.DIV);
              }
              locationDiv.appendChild(img);
            }
          }
          else
          {
            if (parent.getNodeName().equals(HtmlCSSConstants.P) || parent.getNodeName().equals(HtmlCSSConstants.SPAN))
            {
              DomUtil.setElementName(parent, HtmlCSSConstants.DIV);
            }
            locationDiv.insertBefore(img, objNode);
          }
        }
        int xPos = bigImageDescriptor.getXPos();
        int yPos = bigImageDescriptor.getYPos();
        if(!anchorType.equals("page")&&parent.getNodeName().equals(HtmlCSSConstants.DIV))
        {
          style.append("left:").append(pixelTocm(xPos)).append(";top:").append(pixelTocm(yPos)).append(";position:absolute;");
          HtmlConvertorUtil.setAttribute(((Element)locationDiv),"style", ((Element)locationDiv).getAttribute(HtmlCSSConstants.STYLE)+"position:relative;",false);
        }else
        {
          Map<String, String> styleMap = (Map<String, String>) context.get(((Element)locationDiv).getAttribute("id"));
          HtmlConvertorUtil.removeHeightFromLocationDiv(context,(Element)locationDiv,styleMap);
        }
//      }
        
        HtmlConvertorUtil.setAttribute(img,HtmlCSSConstants.CLASS, "group",false);
        HtmlConvertorUtil.setAttribute(img,"_type", "group",false);
        HtmlConvertorUtil.setAttribute(img,HtmlCSSConstants.STYLE, style.toString());
        HtmlConvertorUtil.setAttribute(img,HtmlCSSConstants.SRC, "Pictures/shape/" + bigImageName,false);
        HtmlConvertorUtil.setAttribute(img,HtmlCSSConstants.CKE_SAVED_SRC, "Pictures/shape/" + bigImageName,false);
        HtmlConvertorUtil.setAttribute(img,"_shapeid", img.getAttribute(HtmlCSSConstants.ID),false);
        HtmlConvertorUtil.setAttribute(img, HtmlCSSConstants.ALT, "grouped image");
      HtmlConvertorUtil.removeID(element);
      HtmlConvertorUtil.flatten(context,element,img);
    }
  }

  private String pixelTocm(int value)
  {
    return (value * 2.5399 / 96) + "cm";
  }

  public static boolean isUnderGroup(ConversionContext context)
  {
    if (context.get("GroupImageList") == null)
      return false;
    else
      return true;
  }

  private void groupShapes(final ConversionContext context, final String bigImageName, final ImageDescriptor bigImageDescriptor,
      final List<ImageDescriptor> imageList)
  {
    Callable<String> task = new Callable<String>()
    {
      public String call()
      {
        Iterator iter = imageList.iterator();
        while (iter.hasNext())
        {
          ImageDescriptor imageDescriptor = (ImageDescriptor) iter.next();
          Image image = imageDescriptor.getImage();
          if (image == null)
          {
            String imageSrc = imageDescriptor.getFileName();
            final Future<?> future = context.getTask(context.get("targetFolder") + File.separator + imageSrc);
            try
            {
              future.get();
              String fileName = imageSrc.substring(9);
              int dotIndex = fileName.lastIndexOf(".");
              String fileNewName = fileName.substring(0, dotIndex) + ".png";
              String extName = fileName.substring(dotIndex + 1);
              String path = "Pictures/" + extName + "/" + fileNewName;
              File file = new File(context.get("targetFolder") + File.separator + path);
              image = ImageIO.read(file);
              imageDescriptor.setImage(image);
            }
            catch (Exception e)
            {
              e.printStackTrace();
            }
          }
        }
        File shapeFile = new File(context.get("targetFolder") + File.separator + "Pictures"+ File.separator +"shape");
        if (!shapeFile.exists())
          shapeFile.mkdirs();
        File targetFile = new File(context.get("targetFolder") + File.separator + "Pictures"+ File.separator +"shape"+ File.separator  + bigImageName);
        ImageUtil.groupShapes(targetFile, bigImageDescriptor, imageList);
        return null;
      }
    };

    context.addTask(bigImageName, task);
  }

}
